/**
 * User Controllers
 * Handles user authentication and management with MongoDB
 * @module controllers/users
 */

import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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
    maxAge: 15 * 60 * 1000, // 15 minutes
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
export const register = async (req, res) => {
  const { name, email, phone, password, coordinates } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashedPassword,
    coordinates: coordinates || undefined,
    role: "user",
  });

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  setTokenCookies(res, accessToken, refreshToken);

  // Remove sensitive data
  const userResponse = user.toJSON();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: userResponse },
        "User registered successfully",
      ),
    );
};

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Please contact support.");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  setTokenCookies(res, accessToken, refreshToken);

  // Remove sensitive data
  const userResponse = user.toJSON();

  return res.json(
    new ApiResponse(200, { user: userResponse }, "Login successful"),
  );
};

/**
 * @route   POST /api/users/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token in cookie)
 */
export const refreshToken = async (req, res) => {
  // User info is attached by verifyRefreshToken middleware
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Find user and verify refresh token
  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify the refresh token matches the one in database
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  if (!refreshTokenFromCookie || user.refreshToken !== refreshTokenFromCookie) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Generate new tokens
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save();

  // Set new cookies
  setTokenCookies(res, accessToken, newRefreshToken);

  return res.json(new ApiResponse(200, null, "Token refreshed successfully"));
};

/**
 * @route   POST /api/users/logout
 * @desc    Logout user and clear tokens
 * @access  Public
 */
export const logout = async (req, res) => {
  // If user is authenticated, clear refresh token from database
  if (req.user?.id) {
    await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { refreshToken: 1 } },
      { new: true },
    );
  }

  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json(new ApiResponse(200, null, "Logout successful"));
};

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  const userResponse = user.toJSON();

  return res.json(
    new ApiResponse(200, { user: userResponse }, "User profile retrieved"),
  );
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password -refreshToken").lean();

  return res.json(
    new ApiResponse(
      200,
      { users, total: users.length },
      "Users retrieved successfully",
    ),
  );
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user by ID
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndDelete(id);

  return res.json(new ApiResponse(200, null, "User deleted successfully"));
};
