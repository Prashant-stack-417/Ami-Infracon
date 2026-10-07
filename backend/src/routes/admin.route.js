/**
 * Admin Routes
 * Handles admin authentication and management endpoints
 * @module routes/admin
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registerAdmin,
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getCurrentAdmin,
  getAdminStats,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
} from "../controllers/admin.controller.js";
import { getAllUsers, deleteUser, toggleUserStatus } from "../controllers/users.controller.js";

import {
  validateLogin,
  validateAdminRegister,
  validateAdminUpdate,
} from "../middleware/validate.middleware.js";
import {
  verifyToken,
  verifyRefreshToken,
  verifyAdminRefreshToken,
  verifyAdminToken,
  verifySuperAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 1000 : 5, // 5 failed requests per windowMs in production
  message: {
    success: false,
    message: "Too many failed attempts from this IP, please try again after 15 minutes",
  },
  skipSuccessfulRequests: process.env.NODE_ENV !== "test",
});

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   POST /api/admin/register
 * @desc    Register a new admin (Super Admin only)
 * @access  Private (Super Admin only)
 */
router.post(
  "/register",
  verifyAdminToken,
  verifySuperAdmin,
  validateAdminRegister,
  registerAdmin,
);

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin and get token
 * @access  Public
 */
router.post("/login", authLimiter, validateLogin, loginAdmin);

/**
 * @route   POST /api/admin/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookie)
 */
router.post(
  "/refresh-token",
  verifyAdminRefreshToken,
  refreshAdminToken,
);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

/**
 * @route   POST /api/admin/logout
 * @desc    Logout admin (clear refresh token cookie)
 * @access  Private
 */
router.post("/logout", logoutAdmin);

/**
 * @route   GET /api/admin/me
 * @desc    Get current admin profile
 * @access  Private
 */
router.get("/me", verifyAdminToken, getCurrentAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private
 */
router.get("/stats", verifyAdminToken, getAdminStats);

/**
 * @route   GET /api/admin
 * @desc    Get all admins
 * @access  Private (superadmin only)
 */
router.get("/", verifyAdminToken, verifySuperAdmin, getAllAdmins);

/**
 * @route   PUT /api/admin/:id
 * @desc    Update admin by ID
 * @access  Private (superadmin only)
 */
router.put(
  "/:id",
  verifyAdminToken,
  verifySuperAdmin,
  validateAdminUpdate,
  updateAdmin,
);

/**
 * @route   DELETE /api/admin/:id
 * @desc    Delete admin by ID
 * @access  Private (superadmin only)
 */
router.delete(
  "/:id",
  verifyAdminToken,
  verifySuperAdmin,
  deleteAdmin,
);

// ============================================
// User Management Routes (Admin Access)
// ============================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/users", verifyAdminToken, getAllUsers);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user by ID
 * @access  Private (Admin only)
 */
router.delete("/users/:id", verifyAdminToken, deleteUser);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Block or unblock a user
 * @access  Private (Admin only)
 */
router.patch("/users/:id/status", verifyAdminToken, toggleUserStatus);

export default router;
