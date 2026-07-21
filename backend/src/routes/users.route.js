/**
 * User Routes
 * Handles authentication and user management endpoints
 * @module routes/users
 */

import { Router } from "express";
import rateLimit from "express-rate-limit";
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

import {
  validateLogin,
  validateRegister,
} from "../middleware/validate.middleware.js";
import {
  verifyToken,
  verifyRefreshToken,
} from "../middleware/auth.middleware.js";

const router = Router();

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again after 15 minutes",
  },
});

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authLimiter, validateRegister, register);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", authLimiter, validateLogin, login);

/**
 * @route   POST /api/users/google-auth
 * @desc    Authenticate user with Google OAuth
 * @access  Public
 */
router.post("/google-auth", authLimiter, googleAuth);

/**
 * @route   POST /api/users/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookie)
 */
router.post("/refresh-token", verifyRefreshToken, refreshToken);

/**
 * @route   POST /api/users/logout
 * @desc    Logout user and clear tokens
 * @access  Public
 */
router.post("/logout", logout);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request a password reset link
 * @access  Public
 */
router.post("/forgot-password", authLimiter, forgotPassword);

/**
 * @route   PATCH /api/users/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.patch("/reset-password/:token", authLimiter, resetPassword);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", verifyToken, getCurrentUser);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/profile", verifyToken, updateProfile);

export default router;
