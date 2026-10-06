/**
 * Admin Controller
 * Handles admin authentication and management operations
 * Google-level security: case-insensitive email, brute-force protection, validated secrets
 * @module controllers/admin
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { adminService } from "../services/admin.service.js";
import Admin from "../models/Admin.model.js";

/**
 * Register a new admin
 */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, password, role, permissions } = req.body;
  if (typeof req.body.email !== "string") {
    throw new ApiError(400, "Email must be a valid string");
  }
  const email = req.body.email.toLowerCase().trim();

  // Validate admin email format: username.Admin@gmail.com
  const adminEmailPattern = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i;
  if (!adminEmailPattern.test(email)) {
    throw new ApiError(400, "Admin email must be in format: username.Admin@gmail.com");
  }

  const { admin, accessToken, refreshToken } = await adminService.registerAdmin({
    name, email, password, role, permissions
  });

  // Set refresh token in HTTP-only cookie
  res.cookie("adminRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("adminAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.ADMIN_JWT_EXPIRES || "900", 10) * 1000, // typically 15 mins
  });

  return res.status(201).json(new ApiResponse(201, { admin }, "Admin registered successfully"));
});

/**
 * Login admin — with brute-force protection and case-insensitive email
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (typeof req.body.email !== "string") {
    throw new ApiError(400, "Email must be a valid string");
  }
  const email = req.body.email.toLowerCase().trim();

  // Validate admin email format: username.Admin@gmail.com
  const adminEmailPattern = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i;
  if (!adminEmailPattern.test(email)) {
    throw new ApiError(400, "Invalid Username or Password");
  }

  const { admin, accessToken, refreshToken } = await adminService.loginAdmin(email, password);

  // Set refresh token in HTTP-only cookie
  res.cookie("adminRefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("adminAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.ADMIN_JWT_EXPIRES || "900", 10) * 1000,
  });

  return res.status(200).json(new ApiResponse(200, { admin }, "Admin logged in successfully"));
});

/**
 * Refresh access token
 */
export const refreshAdminToken = asyncHandler(async (req, res) => {
  // req.admin is a decoded JWT payload from verifyAdminRefreshToken middleware
  const adminId = req.admin?.id;
  if (!adminId) throw new ApiError(401, "Invalid refresh token payload");

  // Load the full Admin document to verify isActive and generate a fresh token
  const admin = await Admin.findById(adminId);
  if (!admin) throw new ApiError(401, "Admin not found");
  if (!admin.isActive) throw new ApiError(403, "Admin account is deactivated");

  const accessToken = admin.generateAccessToken();

  res.cookie("adminAccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.ADMIN_JWT_EXPIRES || "900", 10) * 1000,
  });

  return res.status(200).json(new ApiResponse(200, null, "Access token refreshed successfully"));
});

/**
 * Logout admin
 */
export const logoutAdmin = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  res.clearCookie("adminRefreshToken", cookieOptions);
  res.clearCookie("adminAccessToken", cookieOptions);
  return res.status(200).json(new ApiResponse(200, null, "Admin logged out successfully"));
});

/**
 * Get current admin profile
 */
export const getCurrentAdmin = asyncHandler(async (req, res) => {
  const result = await adminService.getCurrentAdmin(req.admin.id);
  return res.status(200).json(new ApiResponse(200, result, "Admin profile retrieved successfully"));
});

/**
 * Get all admins (superadmin only)
 */
export const getAllAdmins = asyncHandler(async (req, res) => {
  const result = await adminService.getAllAdmins();
  return res.status(200).json(new ApiResponse(200, result, "Admins retrieved successfully"));
});

/**
 * Get admin dashboard stats
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getAdminStats();
  return res.status(200).json(new ApiResponse(200, { stats }, "Admin stats retrieved successfully"));
});

/**
 * Update admin
 */
export const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.updateAdmin(id, req.body, req.admin?.id);
  return res.status(200).json(new ApiResponse(200, result, "Admin updated successfully"));
});

/**
 * Delete admin
 */
export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await adminService.deleteAdmin(id, req.admin?.id);
  return res.status(200).json(new ApiResponse(200, null, "Admin deleted successfully"));
});
