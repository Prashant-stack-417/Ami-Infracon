/**
 * User Controllers
 * Handles user authentication and management with MongoDB
 * Google-level security: case-insensitive email, brute-force protection, validated secrets
 * @module controllers/users
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { usersService } from "../services/users.service.js";

/**
 * Set token cookies
 * @param {Object} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Access token cookie (short-lived)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Refresh token cookie (long-lived)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  if (typeof req.body.email !== "string") {
    throw new ApiError(400, "Email must be a valid string");
  }
  const data = { ...req.body, email: req.body.email.toLowerCase().trim() };

  const { user, accessToken, refreshToken } = await usersService.register(data);
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(201).json(new ApiResponse(201, { user }, "User registered successfully"));
});

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  if (typeof req.body.email !== "string") {
    throw new ApiError(400, "Email must be a valid string");
  }
  const email = req.body.email.toLowerCase().trim();
  const { password } = req.body;

  const { user, accessToken, refreshToken } = await usersService.login(email, password);
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(200).json(new ApiResponse(200, { user }, "Login successful"));
});

/**
 * @route   POST /api/users/google-auth
 * @desc    Authenticate user with Google OAuth token
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const result = await usersService.googleAuth(req.body);
  setTokenCookies(res, result.accessToken, result.refreshToken);

  return res.status(200).json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, result.isNew ? "Account created successfully" : "Login successful"));
});

/**
 * @route   POST /api/users/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookie)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const refreshTokenFromCookie = req.cookies?.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await usersService.refreshToken(userId, refreshTokenFromCookie);
  
  setTokenCookies(res, accessToken, newRefreshToken);

  return res.status(200).json(new ApiResponse(200, null, "Token refreshed successfully"));
});

/**
 * @route   POST /api/users/logout
 * @desc    Logout user and clear tokens
 * @access  Public
 */
export const logout = asyncHandler(async (req, res) => {
  await usersService.logout(req.user?.id);

  const isProduction = process.env.NODE_ENV === "production";
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  };

  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await usersService.getCurrentUser(userId);
  return res.status(200).json(new ApiResponse(200, { user }, "User profile retrieved"));
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await usersService.updateProfile(userId, req.body);
  return res.status(200).json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers();
  return res.status(200).json(new ApiResponse(200, { users, total: users.length }, "Users retrieved successfully"));
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user by ID
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await usersService.deleteUser(id);
  return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Block or unblock a user
 * @access  Private (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be true or false");
  }

  const user = await usersService.toggleUserStatus(id, isActive);
  return res.status(200).json(new ApiResponse(200, { user: { _id: user._id, name: user.name, isActive: user.isActive } }, isActive ? "User unblocked successfully" : "User blocked successfully"));
});

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request a password reset link
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  if (!req.body.email || typeof req.body.email !== "string") {
    throw new ApiError(400, "Email is required and must be a valid string");
  }
  const email = req.body.email.toLowerCase().trim();

  const clientUrl = process.env.ALLOWED_ORIGINS?.split(",")[0]?.trim() || "http://localhost:5173";
  
  // Fire and forget (don't block the response)
  usersService.forgotPassword(email, clientUrl).catch(console.error);

  return res.status(200).json(new ApiResponse(200, null, "If an account with that email exists, a password reset link has been sent."));
});

/**
 * @route   PATCH /api/users/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  await usersService.resetPassword(token, password);
  return res.status(200).json(new ApiResponse(200, null, "Password has been successfully reset"));
});
