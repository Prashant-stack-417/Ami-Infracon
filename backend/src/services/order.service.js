import Order from "../models/Order.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendEmail } from "../utils/sendEmail.js";

class OrderService {
  async addOrder(userId, user, data) {
    const { title, quantity, address, description, totalAmount } = data;

    const order = await Order.create({
      userId,
      title: title.trim(),
      quantity: Number(quantity),
      address: address.trim(),
      description: description?.trim() || "",
      totalAmount: Number(totalAmount) || 0,
      status: "pending",
      statusHistory: [{ status: "pending", comment: "Order placed" }]
    });

    if (user?.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; text-align: center;">Order Received!</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${user.name || "Customer"},</p>
          <p style="color: #334155; font-size: 16px;">We have received your order for <strong>${order.title}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">Order ID: <code>#${order._id.toString().slice(-8)}</code></p>
          <p style="color: #334155; font-size: 16px;">We will notify you once the status updates.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
        </div>
      `;
      sendEmail({
        to: user.email,
        subject: "Ami Infracon - Order Received",
        html: emailHtml,
      });
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

    if (
      order.userId._id.toString() !== userId &&
      userRole !== "admin" &&
      userRole !== "superadmin"
    ) {
      throw new ApiError(403, "You do not have permission to update this order");
    }

    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      throw Object.assign(
        new Error(`Status must be one of: ${validStatuses.join(", ")}`),
        { statusCode: 400 }
      );
    }
    if (status && userRole !== "admin" && userRole !== "superadmin" && status !== "cancelled") {
      throw Object.assign(
        new Error("Customers can only cancel their orders"),
        { statusCode: 403 }
      );
    }

    if (
      !order.canBeModified() &&
      userRole !== "admin" &&
      userRole !== "superadmin"
    ) {
      throw new ApiError(400, "This order cannot be modified");
    }

    if (status && order.status !== status) {
      order.status = status;
      order.statusHistory.push({ status, comment: "Status updated" });
      await order.save();

      if (order.userId?.email) {
        let statusColor = "#eab308";
        if (status === "processing") statusColor = "#3b82f6";
        if (status === "completed") statusColor = "#22c55e";
        if (status === "cancelled") statusColor = "#ef4444";

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a; text-align: center;">Order Update</h2>
            <p style="color: #334155; font-size: 16px;">Hello ${order.userId.name || "Customer"},</p>
            <p style="color: #334155; font-size: 16px;">The status of your order for <strong>${order.title}</strong> has been updated.</p>
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">New Status</p>
              <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: ${statusColor}; text-transform: capitalize;">${status}</p>
            </div>
            <p style="color: #334155; font-size: 16px;">Order ID: <code>#${order._id.toString().slice(-8)}</code></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
          </div>
        `;

        sendEmail({
          to: order.userId.email,
          subject: `Ami Infracon - Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: emailHtml,
        });
      }
    }

    return order;
  }

  async deleteOrder(id, userId, userRole) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (
      order.userId.toString() !== userId &&
      userRole !== "admin" &&
      userRole !== "superadmin"
    ) {
      throw new ApiError(403, "You do not have permission to delete this order");
    }

    if (
      !order.canBeCancelled() &&
      userRole !== "admin" &&
      userRole !== "superadmin"
    ) {
      throw new ApiError(400, "This order cannot be deleted");
    }

    await Order.findByIdAndDelete(id);
    return null;
  }

  async checkoutCart(userId, user, items, address) {
    const created = [];
    for (const it of items) {
      const title = (it.title || it.name || "Item").toString();
      const quantity = Number(it.quantity) || 1;
      let totalAmount = Number(it.price || 0) * quantity;

      const order = await Order.create({
        userId,
        title,
        quantity,
        address: address.trim(),
        description: it.description || "",
        totalAmount,
        status: "pending",
        statusHistory: [{ status: "pending", comment: "Order placed via checkout" }]
      });
      created.push(order);
    }

    if (user?.email && created.length > 0) {
      const orderItemsList = created.map(o => `<li>${o.title} (x${o.quantity})</li>`).join('');
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; text-align: center;">Order Received!</h2>
          <p style="color: #334155; font-size: 16px;">Hello ${user.name || "Customer"},</p>
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
      });
    }

    return created;
  }
}

export const orderService = new OrderService();
