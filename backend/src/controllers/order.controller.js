/**
 * Order Controllers
 * Handles order/donation management with MongoDB
 * @module controllers/order
 */

import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

/**
 * @route   POST /api/order/add
 * @desc    Create a new order/donation
 * @access  Private
 */
export const addOrder = async (req, res) => {
  const { title, quantity, address, description, totalAmount } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User must be authenticated to create an order");
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
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
};

/**
 * @route   GET /api/order/view/user
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
export const viewUserOrders = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User must be authenticated to view orders");
  }

  // Get orders for the current user, sorted by creation date (newest first)
  const userOrders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return res.json(
    new ApiResponse(200, userOrders, `Retrieved ${userOrders.length} order(s)`),
  );
};

/**
 * @route   GET /api/order/view/all
 * @desc    Get all orders (admin only)
 * @access  Private (Admin)
 */
export const viewAllOrders = async (req, res) => {
  const userRole = req.user?.role;

  if (userRole !== "admin" && userRole !== "superadmin") {
    throw new ApiError(403, "Only administrators can view all orders");
  }

  // Get all orders with user information, sorted by creation date
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return res.json(
    new ApiResponse(200, orders, `Retrieved ${orders.length} total order(s)`),
  );
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
    throw new ApiError(404, "Order not found");
  }

  // Users can only view their own orders unless they're admin
  if (
    order.userId._id.toString() !== userId &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw new ApiError(403, "You do not have permission to view this order");
  }

  return res.json(new ApiResponse(200, order, "Order retrieved successfully"));
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

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Users can only update their own orders unless they're admin
  if (
    order.userId.toString() !== userId &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw new ApiError(403, "You do not have permission to update this order");
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
    throw new ApiError(400, "This order cannot be modified");
  }

  // Update order
  if (status) {
    order.status = status;
    await order.save();
  }

  return res.json(new ApiResponse(200, order, "Order updated successfully"));
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
    throw new ApiError(404, "Order not found");
  }

  // Users can only delete their own orders unless they're admin
  if (
    order.userId.toString() !== userId &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw new ApiError(403, "You do not have permission to delete this order");
  }

  // Check if order can be cancelled/deleted
  if (
    !order.canBeCancelled() &&
    userRole !== "admin" &&
    userRole !== "superadmin"
  ) {
    throw new ApiError(400, "This order cannot be deleted");
  }

  // Delete order
  await Order.findByIdAndDelete(id);

  return res.json(new ApiResponse(200, null, "Order deleted successfully"));
};

/**
 * POST /api/order/checkout
 * Accepts { items: [{ title, quantity }], address }
 */
export const checkoutCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "User must be authenticated");

  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart items required");
  }
  if (!address || typeof address !== "string") {
    throw new ApiError(400, "Address is required");
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
    });
    created.push(order);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { orders: created }, "Checkout complete"));
};
