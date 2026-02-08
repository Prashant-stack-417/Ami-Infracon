/**
 * Admin Routes
 * Handles admin authentication and management endpoints
 * @module routes/admin
 */

import { Router } from "express";
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
import { getAllUsers, deleteUser } from "../controllers/users.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateLogin,
  validateRegister,
} from "../middleware/validate.middleware.js";
import {
  verifyToken,
  verifyRefreshToken,
  verifyAdminToken,
  verifySuperAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

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
  validateRegister,
  asyncHandler(registerAdmin),
);

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin and get token
 * @access  Public
 */
router.post("/login", validateLogin, asyncHandler(loginAdmin));

/**
 * @route   POST /api/admin/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookie)
 */
router.post(
  "/refresh-token",
  verifyRefreshToken,
  asyncHandler(refreshAdminToken),
);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

/**
 * @route   POST /api/admin/logout
 * @desc    Logout admin (clear refresh token cookie)
 * @access  Private
 */
router.post("/logout", verifyAdminToken, asyncHandler(logoutAdmin));

/**
 * @route   GET /api/admin/me
 * @desc    Get current admin profile
 * @access  Private
 */
router.get("/me", verifyAdminToken, asyncHandler(getCurrentAdmin));

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Private
 */
router.get("/stats", verifyAdminToken, asyncHandler(getAdminStats));

/**
 * @route   GET /api/admin
 * @desc    Get all admins
 * @access  Private (superadmin only)
 */
router.get("/", verifyAdminToken, verifySuperAdmin, asyncHandler(getAllAdmins));

/**
 * @route   PUT /api/admin/:id
 * @desc    Update admin by ID
 * @access  Private (superadmin only)
 */
router.put(
  "/:id",
  verifyAdminToken,
  verifySuperAdmin,
  asyncHandler(updateAdmin),
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
  asyncHandler(deleteAdmin),
);

// ============================================
// User Management Routes (Admin Access)
// ============================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/users", verifyAdminToken, asyncHandler(getAllUsers));

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user by ID
 * @access  Private (Admin only)
 */
router.delete("/users/:id", verifyAdminToken, asyncHandler(deleteUser));

export default router;
