/**
 * Order Controllers
 * Handles order/donation management with MongoDB
 * @module controllers/order
 */

import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";


import { sendEmail } from "../utils/sendEmail.js";

/**
 * @route   POST /api/order/add
 * @desc    Create a new order/donation
 * @access  Private
 */
export const addOrder = async (req, res) => {
  const { title, quantity, address, description, totalAmount } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw Object.assign(new Error("User must be authenticated to create an order"), { statusCode: 401 });
  }

  // Create new order
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

  // Fetch user for email
  const user = await req.user;
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

  return res
    .status(201)
    .json({ success: true, data: order, message: "Order created successfully" });
};

/**
 * @route   GET /api/order/view/user
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
export const viewUserOrders = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw Object.assign(new Error("User must be authenticated to view orders"), { statusCode: 401 });
  }

  // Get orders for the current user, sorted by creation date (newest first)
  const userOrders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    data: userOrders,
    message: `Retrieved ${userOrders.length} order(s)`
  });
};

/**
 * @route   GET /api/order/view/all
 * @desc    Get all orders (admin only)
 * @access  Private (Admin)
 */
export const viewAllOrders = async (req, res) => {
  // Get all orders with user information, sorted by creation date
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    data: orders,
    message: `Retrieved ${orders.length} total order(s)`
  });
};

/**
 * @route   GET /api/order/:id
 * @desc    Get a specific order by ID
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const order = await Order.findById(id).populate("userId", "name email");

  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  }

  // Users can only view their own orders unless they're admin
  if (
    order.userId._id.toString() !== userId &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw Object.assign(new Error("You do not have permission to view this order"), { statusCode: 403 });
  }

  return res.json({ success: true, data: order, message: "Order retrieved successfully" });
};

/**
 * @route   PATCH /api/order/:id
 * @desc    Update order status
 * @access  Private
 */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const order = await Order.findById(id).populate("userId", "name email");

  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  }

  // Users can only update their own orders unless they're admin
  if (
    order.userId._id.toString() !== userId &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw Object.assign(new Error("You do not have permission to update this order"), { statusCode: 403 });
  }

  // Validate status
  const validStatuses = ["pending", "processing", "completed", "cancelled"];
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${validStatuses.join(", ")}`,
    );
  }

  // Check if order can be modified
  if (
    !order.canBeModified() &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw Object.assign(new Error("This order cannot be modified"), { statusCode: 400 });
  }

  // Update order
  if (status && order.status !== status) {
    order.status = status;
    order.statusHistory.push({ status, comment: "Status updated" });
    await order.save();

    // Send email notification to user
    if (order.userId?.email) {
      let statusColor = "#eab308"; // yellow for pending
      if (status === "processing") statusColor = "#3b82f6"; // blue
      if (status === "completed") statusColor = "#22c55e"; // green
      if (status === "cancelled") statusColor = "#ef4444"; // red

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

  return res.json({ success: true, data: order, message: "Order updated successfully" });
};

/**
 * @route   DELETE /api/order/:id
 * @desc    Delete an order
 * @access  Private
 */
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const order = await Order.findById(id);

  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  }

  // Users can only delete their own orders unless they're admin
  if (
    order.userId.toString() !== userId &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw Object.assign(new Error("You do not have permission to delete this order"), { statusCode: 403 });
  }

  // Check if order can be cancelled/deleted
  if (
    !order.canBeCancelled() &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw Object.assign(new Error("This order cannot be deleted"), { statusCode: 400 });
  }

  // Delete order
  await Order.findByIdAndDelete(id);

  return res.json({ success: true, data: null, message: "Order deleted successfully" });
};

/**
 * POST /api/order/checkout
 * Accepts { items: [{ title, quantity }], address }
 */
export const checkoutCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw Object.assign(new Error("User must be authenticated"), { statusCode: 401 });

  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error("Cart items required"), { statusCode: 400 });
  }
  if (!address || typeof address !== "string") {
    throw Object.assign(new Error("Address is required"), { statusCode: 400 });
  }

  const created = [];
  for (const it of items) {
    const title = (it.title || it.name || "Item").toString();
    const quantity = Number(it.quantity) || 1;

    // Calculate total amount based on product price
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

  // Fetch user for email
  const user = await req.user;
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

  return res
    .status(201)
    .json({ success: true, data: { orders: created }, message: "Checkout complete" });
};
