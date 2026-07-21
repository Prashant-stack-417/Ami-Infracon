/**
 * Order Controllers
 * Handles order/donation management with MongoDB
 * @module controllers/order
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { orderService } from "../services/order.service.js";

/**
 * @route   POST /api/order/add
 * @desc    Create a new order/donation
 * @access  Private
 */
export const addOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "User must be authenticated to create an order");
  }

  const order = await orderService.addOrder(userId, req.user, req.body);
  return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
});

/**
 * @route   GET /api/order/view/user
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
export const viewUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "User must be authenticated to view orders");
  }

  const userOrders = await orderService.viewUserOrders(userId);
  return res.status(200).json(new ApiResponse(200, userOrders, `Retrieved ${userOrders.length} order(s)`));
});

/**
 * @route   GET /api/order/view/all
 * @desc    Get all orders (admin only)
 * @access  Private (Admin)
 */
export const viewAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.viewAllOrders();
  return res.status(200).json(new ApiResponse(200, orders, `Retrieved ${orders.length} total order(s)`));
});

/**
 * @route   GET /api/order/:id
 * @desc    Get a specific order by ID
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const order = await orderService.getOrderById(id, userId, userRole);
  return res.status(200).json(new ApiResponse(200, order, "Order retrieved successfully"));
});

/**
 * @route   PATCH /api/order/:id
 * @desc    Update order status
 * @access  Private
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const order = await orderService.updateOrderStatus(id, status, userId, userRole);
  return res.status(200).json(new ApiResponse(200, order, "Order updated successfully"));
});

/**
 * @route   DELETE /api/order/:id
 * @desc    Delete an order
 * @access  Private
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  await orderService.deleteOrder(id, userId, userRole);
  return res.status(200).json(new ApiResponse(200, null, "Order deleted successfully"));
});

/**
 * POST /api/order/checkout
 * Accepts { items: [{ title, quantity }], address }
 */
export const checkoutCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "User must be authenticated");

  const { items, address } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart items required");
  }
  if (!address || typeof address !== "string") {
    throw new ApiError(400, "Address is required");
  }

  const createdOrders = await orderService.checkoutCart(userId, req.user, items, address);
  return res.status(201).json(new ApiResponse(201, { orders: createdOrders }, "Checkout complete"));
});
