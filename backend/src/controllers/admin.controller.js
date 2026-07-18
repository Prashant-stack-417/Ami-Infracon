/**
 * Admin Controller
 * Handles admin authentication and management operations
 * Google-level security: case-insensitive email, brute-force protection, validated secrets
 * @module controllers/admin
 */

import bcrypt from "bcryptjs";
import Admin from "../models/Admin.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { BCRYPT_SALT_ROUNDS } from "../models/User.model.js";

/**
 * Register a new admin
 */
export const registerAdmin = async (req, res) => {
  const { name, password, role, permissions } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  // Validate admin email format: username.Admin@gmail.com
  const adminEmailPattern = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i;
  if (!adminEmailPattern.test(email)) {
    throw new ApiError(
      400,
      "Admin email must be in format: username.Admin@gmail.com",
    );
  }

  // Check if admin already exists (case-insensitive — email already lowered)
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(409, "Admin with this email already exists");
  }

  // Hash password with strong salt rounds
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Create new admin
  const admin = await Admin.create({
    name: name?.trim(),
    email,
    password: hashedPassword,
    role: role || "admin",
    permissions: permissions || [],
  });

  // Generate tokens
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        admin: admin.toJSON(),
        accessToken,
      },
      "Admin registered successfully",
    ),
  );
};

/**
 * Login admin — with brute-force protection and case-insensitive email
 */
export const loginAdmin = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  // Validate admin email format: username.Admin@gmail.com
  const adminEmailPattern = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i;
  if (!adminEmailPattern.test(email)) {
    throw new ApiError(400, "Invalid Username or Password");
  }

  // Find admin by email and include password + lockout fields
  const admin = await Admin.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  if (!admin) {
    // Timing-safe: hash a dummy password so response time is consistent
    await bcrypt.hash("dummy", BCRYPT_SALT_ROUNDS);
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if account is locked
  if (admin.isLocked) {
    const minutesLeft = Math.ceil(
      (admin.lockUntil - Date.now()) / 60000,
    );
    throw new ApiError(
      423,
      `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
    );
  }

  // Check if admin is active
  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is deactivated");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    // Increment failed attempts (may lock the account)
    await admin.incLoginAttempts();
    throw new ApiError(401, "Invalid credentials");
  }

  // ── Success — reset failed attempts ──
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }

  // Generate tokens
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: admin.toJSON(),
        accessToken,
      },
      "Admin logged in successfully",
    ),
  );
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const refreshAdminToken = async (req, res) => {
  const admin = req.admin; // Set by verifyRefreshToken middleware

  // Generate new access token
  const accessToken = admin.generateAccessToken();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully",
      ),
    );
};

/**
 * Logout admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const logoutAdmin = async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Admin logged out successfully"));
};

/**
 * Get current admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurrentAdmin = async (req, res) => {
  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin: admin.toJSON() },
        "Admin profile retrieved successfully",
      ),
    );
};

/**
 * Get all admins (superadmin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllAdmins = async (req, res) => {
  const admins = await Admin.find({})
    .select("-password -loginAttempts -lockUntil")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admins, count: admins.length },
        "Admins retrieved successfully",
      ),
    );
};

/**
 * Get admin dashboard stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAdminStats = async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, totalAdmins] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Admin.countDocuments(),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalAdmins,
        },
      },
      "Admin stats retrieved successfully",
    ),
  );
};

/**
 * Update admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, permissions, isActive } = req.body;

  const admin = await Admin.findById(id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // Update fields
  if (name) admin.name = name.trim();
  if (email) {
    admin.email = email.toLowerCase().trim();

    // Keep update validation aligned with registration format rules.
    const adminEmailPattern = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i;
    if (!adminEmailPattern.test(admin.email)) {
      throw new ApiError(
        400,
        "updateAdmin: Admin email must be in format: username.Admin@gmail.com",
      );
    }
  }
  if (role) admin.role = role;
  if (permissions) admin.permissions = permissions;
  if (typeof isActive === "boolean") admin.isActive = isActive;

  await admin.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { admin: admin.toJSON() },
        "Admin updated successfully",
      ),
    );
};

/**
 * Delete admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id);

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  await admin.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Admin deleted successfully"));
};
