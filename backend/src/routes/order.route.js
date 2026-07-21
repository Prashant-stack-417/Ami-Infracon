/**
 * Order Routes
 * Handles order/donation management endpoints
 * @module routes/order
 */

import { Router } from "express";
import {
  addOrder,
  viewUserOrders,
  viewAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  checkoutCart,
} from "../controllers/order.controller.js";

import { validateOrder } from "../middleware/validate.middleware.js";
import { verifyUserOrAdmin, verifyAdminToken } from "../middleware/auth.middleware.js";

const router = Router();

// All order routes require authentication (user or admin)
router.use(verifyUserOrAdmin);

// ============================================
// Order Management Routes
// ============================================

/**
 * @route   POST /api/order/add
 * @desc    Create a new order/donation
 * @access  Private
 */
router.post("/add", validateOrder, addOrder);
// Checkout endpoint: create orders from cart
router.post("/checkout", checkoutCart);

/**
 * @route   GET /api/order/view/user
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
router.get("/view/user", viewUserOrders);

/**
 * @route   GET /api/order/view/all
 * @desc    Get all orders (admin only)
 * @access  Private (Admin)
 */
router.get("/view/all", verifyAdminToken, viewAllOrders);

/**
 * @route   GET /api/order/:id
 * @desc    Get a specific order by ID
 * @access  Private
 */
router.get("/:id", getOrderById);

/**
 * @route   PATCH /api/order/:id
 * @desc    Update order status
 * @access  Private
 */
router.patch("/:id", updateOrderStatus);

/**
 * @route   DELETE /api/order/:id
 * @desc    Delete an order
 * @access  Private
 */
router.delete("/:id", deleteOrder);

export default router;
