import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * HTML-escape a string for safe insertion into email templates.
 * Prevents XSS via user-provided values in email bodies.
 */
function htmlEscape(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

class OrderService {
  async addOrder(userId, user, data) {
    const { productId, quantity, address, description } = data;

    if (!productId) {
      throw new ApiError(400, "productId is required");
    }

    const qty = Number(quantity);
    if (!qty || qty < 1) throw new ApiError(400, "Quantity must be at least 1");
    if (!address || typeof address !== "string" || !address.trim()) {
      throw new ApiError(400, "Address is required");
    }

    // Atomic stock decrement — fails if product not found, inactive, or insufficient stock
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        isActive: true,
        quantity: { $gte: qty },
        minOrderQuantity: { $lte: qty },
      },
      { $inc: { quantity: -qty } },
      { new: true }
    );

    if (!product) {
      // Distinguish between not found, insufficient stock, and minOrderQty
      const exists = await Product.findOne({ _id: productId, isActive: true });
      if (!exists) throw new ApiError(404, "Product not found or is inactive");
      if (qty < exists.minOrderQuantity) {
        throw new ApiError(400, `Minimum order quantity is ${exists.minOrderQuantity}`);
      }
      throw new ApiError(400, `Insufficient stock. Only ${exists.quantity} unit(s) available.`);
    }

    const totalAmount = product.price * qty;

    const order = await Order.create({
      userId,
      productId: product._id,
      title: product.chemicalname,
      quantity: qty,
      address: address.trim(),
      description: description?.trim() || "",
      totalAmount,
      status: "pending",
      statusHistory: [{ status: "pending", comment: "Order placed" }]
    });

    if (user?.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; text-align: center;">Order Received!</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${htmlEscape(user.name || "Customer")},</p>
          <p style="color: #334155; font-size: 16px;">We have received your order for <strong>${htmlEscape(order.title)}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">Order ID: <code>#${htmlEscape(order._id.toString().slice(-8))}</code></p>
          <p style="color: #334155; font-size: 16px;">We will notify you once the status updates.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
        </div>
      `;
      sendEmail({
        to: user.email,
        subject: "Ami Infracon - Order Received",
        html: emailHtml,
      }).catch((err) => console.error("[Email] Failed to send order confirmation:", err.message));
    }

    return order;
  }

  async viewUserOrders(userId) {
    return await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async viewAllOrders() {
    return await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  async getOrderById(id, userId, userRole) {
    const order = await Order.findById(id).populate("userId", "name email");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (
      order.userId._id.toString() !== userId &&
      userRole !== "admin" &&
      userRole !== "superadmin"
    ) {
      throw new ApiError(403, "You do not have permission to view this order");
    }

    return order;
  }

  async updateOrderStatus(id, status, userId, userRole) {
    const order = await Order.findById(id).populate("userId", "name email");

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Authorization check
    const isOwner = order.userId._id.toString() === userId;
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "You do not have permission to update this order");
    }

    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    // Customers may only cancel their own orders; only admins set processing/completed
    if (status && !isAdmin && status !== "cancelled") {
      throw new ApiError(403, "Customers can only cancel their orders");
    }
    if (status && isAdmin && status === "cancelled" && !isOwner) {
      // Admins can also cancel on behalf of users — allowed
    }

    if (
      !order.canBeModified() &&
      !isAdmin
    ) {
      throw new ApiError(400, "This order cannot be modified");
    }

    if (status && order.status !== status) {
      const previousStatus = order.status;
      order.status = status;
      order.statusHistory.push({ status, comment: "Status updated" });
      await order.save();

      // Bug #13: Restore stock on cancellation
      if (status === "cancelled" && previousStatus !== "cancelled") {
        await Product.findOneAndUpdate(
          { _id: order.productId },
          { $inc: { quantity: order.quantity } }
        ).catch(() => {}); // Best-effort; product may have been deleted
      }

      if (order.userId?.email) {
        let statusColor = "#eab308";
        if (status === "processing") statusColor = "#3b82f6";
        if (status === "completed") statusColor = "#22c55e";
        if (status === "cancelled") statusColor = "#ef4444";

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a; text-align: center;">Order Update</h2>
            <p style="color: #334155; font-size: 16px;">Hello ${htmlEscape(order.userId.name || "Customer")},</p>
            <p style="color: #334155; font-size: 16px;">The status of your order for <strong>${htmlEscape(order.title)}</strong> has been updated.</p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">New Status</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: ${statusColor}; text-transform: capitalize;">${htmlEscape(status)}</p>
            </div>
            <p style="color: #334155; font-size: 16px;">Order ID: <code>#${htmlEscape(order._id.toString().slice(-8))}</code></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
          </div>
        `;

        sendEmail({
          to: order.userId.email,
          subject: `Ami Infracon - Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: emailHtml,
        }).catch((err) => console.error("[Email] Failed to send status update:", err.message));
      }
    }

    return order;
  }

  async deleteOrder(id, userId, userRole) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const isOwner = order.userId.toString() === userId;
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    // Customers may only delete (cancel) their own orders
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "You do not have permission to delete this order");
    }

    if (
      !order.canBeCancelled() &&
      !isAdmin
    ) {
      throw new ApiError(400, "This order cannot be deleted");
    }

    if (order.status !== "cancelled") {
      await Product.findOneAndUpdate(
        { _id: order.productId },
        { $inc: { quantity: order.quantity } }
      ).catch(() => {}); // Best-effort
    }

    await Order.findByIdAndDelete(id);
    return null;
  }

  async checkoutCart(userId, user, items, address) {
    // items must be [{ productId, quantity }] — price is NEVER trusted from client
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Cart items are required");
    }

    const created = [];
    const decrements = [];

    try {
      for (const it of items) {
        if (!it.productId) {
          throw new ApiError(400, "Each cart item must have a productId");
        }
        const qty = Number(it.quantity) || 1;

        // Atomic stock decrement — rejects inactive products, insufficient stock, and minOrderQuantity violations
        const product = await Product.findOneAndUpdate(
          {
            _id: it.productId,
            isActive: true,
            quantity: { $gte: qty },
            minOrderQuantity: { $lte: qty },
          },
          { $inc: { quantity: -qty } },
          { new: true }
        );

        if (!product) {
          const exists = await Product.findOne({ _id: it.productId, isActive: true });
          if (!exists) throw new ApiError(404, `Product ${it.productId} not found or is inactive`);
          if (qty < exists.minOrderQuantity) {
             throw new ApiError(400, `Minimum order quantity for "${exists.chemicalname}" is ${exists.minOrderQuantity}`);
          }
          throw new ApiError(400, `Insufficient stock for "${exists.chemicalname}". Only ${exists.quantity} unit(s) available.`);
        }

        decrements.push({ productId: product._id, qty });

        const totalAmount = product.price * qty;

        const order = await Order.create({
          userId,
          productId: product._id,
          title: product.chemicalname,
          quantity: qty,
          address: address.trim(),
          description: it.description || "",
          totalAmount,
          status: "pending",
          statusHistory: [{ status: "pending", comment: "Order placed via checkout" }]
        });
        created.push(order);
      }
    } catch (err) {
      // Rollback all decrements
      for (const dec of decrements) {
        await Product.findByIdAndUpdate(dec.productId, { $inc: { quantity: dec.qty } }).catch(() => {});
      }
      // Rollback all created orders
      for (const order of created) {
        await Order.findByIdAndDelete(order._id).catch(() => {});
      }
      throw err;
    }

    if (user?.email && created.length > 0) {
      const orderItemsList = created.map(o => `<li>${htmlEscape(o.title)} (x${o.quantity})</li>`).join('');
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; text-align: center;">Order Received!</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${htmlEscape(user.name || "Customer")},</p>
          <p style="color: #334155; font-size: 16px;">We have received your order for the following items:</p>
          <ul style="color: #334155; font-size: 16px;">${orderItemsList}</ul>
          <p style="color: #334155; font-size: 16px;">We will notify you once the status updates.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
        </div>
      `;
      sendEmail({
        to: user.email,
        subject: "Ami Infracon - Order Received",
        html: emailHtml,
      }).catch((err) => console.error("[Email] Failed to send checkout confirmation:", err.message));
    }

    return created;
  }
}

export const orderService = new OrderService();

