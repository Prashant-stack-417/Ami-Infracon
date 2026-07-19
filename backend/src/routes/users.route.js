/**
 * User Routes
 * Handles authentication and user management endpoints
 * @module routes/users
 */

import { Router } from "express";
import {
  login,
  register,
  refreshToken,
  logout,
  getCurrentUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  updateProfile,
} from "../controllers/users.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateLogin,
  validateRegister,
} from "../middleware/validate.middleware.js";
import {
  verifyToken,
  verifyRefreshToken,
} from "../middleware/auth.middleware.js";

const router = Router();

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateRegister, asyncHandler(register));

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", validateLogin, asyncHandler(login));

/**
 * @route   POST /api/users/google-auth
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 */
router.post("/google-auth", asyncHandler(googleAuth));

/**
 * @route   POST /api/users/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookie)
 */
router.post("/refresh-token", verifyRefreshToken, asyncHandler(refreshToken));

/**
 * @route   POST /api/users/logout
 * @desc    Logout user and clear tokens
 * @access  Public
 */
router.post("/logout", asyncHandler(logout));

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request a password reset link
 * @access  Public
 */
router.post("/forgot-password", asyncHandler(forgotPassword));

/**
 * @route   PATCH /api/users/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.patch("/reset-password/:token", asyncHandler(resetPassword));

// ============================================
// Protected Routes (Authentication Required)
// ============================================

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", verifyToken, asyncHandler(getCurrentUser));

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/profile", verifyToken, asyncHandler(updateProfile));

export default router;
