/**
 * User Controllers
 * Handles user authentication and management with MongoDB
 * Google-level security: case-insensitive email, brute-force protection, validated secrets
 * @module controllers/users
 */

import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import User, { BCRYPT_SALT_ROUNDS } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const googleClient = new OAuth2Client(process.env.CLIENT_ID);

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
export const register = async (req, res) => {
  const { name, phone, password, coordinates } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  // Check if user already exists (case-insensitive — email already lowered)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Hash password with strong salt rounds
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Create new user
  const user = await User.create({
    name: name.trim(),
    email,
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
  const { password } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  // Find user and include password + lockout fields
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  if (!user) {
    // Timing-safe: hash a dummy password so response time is consistent
    await bcrypt.hash("dummy", BCRYPT_SALT_ROUNDS);
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if account is locked
  if (user.isLocked) {
    const minutesLeft = Math.ceil(
      (user.lockUntil - Date.now()) / 60000,
    );
    throw new ApiError(
      423,
      `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Please contact support.");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    // Increment failed attempts (may lock the account)
    await user.incLoginAttempts();
    throw new ApiError(401, "Invalid email or password");
  }

  // ── Success — reset failed attempts ──
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
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
 * @route   POST /api/users/google-auth
 * @desc    Authenticate user with Google OAuth token
 * @access  Public
 */
export const googleAuth = async (req, res) => {
  const { credential, email, name, googleId, accessToken } = req.body;

  let userEmail, userName;

  try {
    if (credential) {
      // Method 1: Using JWT credential (Google Login component)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.CLIENT_ID,
      });

      const payload = ticket.getPayload();
      userEmail = payload.email;
      userName = payload.name;
    } else if (email && accessToken) {
      // Method 2: Using access token (useGoogleLogin hook)
      // Verify the access token by fetching user info from Google
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new ApiError(401, "Invalid Google access token");
      }

      const googleUser = await response.json();
      userEmail = googleUser.email;
      userName = name || googleUser.name;
    } else {
      throw new ApiError(400, "Google credential or access token is required");
    }

    if (!userEmail) {
      throw new ApiError(400, "Email not provided by Google");
    }

    // Check if user exists
    let user = await User.findOne({ email: userEmail.toLowerCase() });

    if (user) {
      // User exists, log them in
      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(
          403,
          "Account is deactivated. Please contact support.",
        );
      }
    } else {
      // Create new user with Google account
      // Generate a random password for Google users (they won't use it)
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8) + Date.now().toString(),
        BCRYPT_SALT_ROUNDS,
      );

      user = await User.create({
        name: userName || userEmail.split("@")[0],
        email: userEmail.toLowerCase().trim(),
        phone: `+91${Date.now().toString().slice(-10)}`, // Temporary phone, user should update
        password: randomPassword,
        role: "user",
        isActive: true,
      });
    }

    // Generate tokens
    const jwtAccessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setTokenCookies(res, jwtAccessToken, refreshToken);

    // Remove sensitive data
    const userResponse = user.toJSON();

    return res.json(
      new ApiResponse(
        200,
        { user: userResponse, accessToken: jwtAccessToken },
        user.createdAt.getTime() === user.updatedAt.getTime()
          ? "Account created successfully"
          : "Login successful",
      ),
    );
  } catch (error) {
    // Handle Google verification errors
    if (error.name === "ApiError") {
      throw error;
    }
    throw new ApiError(401, "Invalid Google token");
  }
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

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Block or unblock a user
 * @access  Private (Admin only)
 */
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be true or false");
  }

  const user = await User.findById(id).select("+refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isActive = isActive;

  // Invalidate all active sessions immediately when blocking
  if (!isActive) {
    user.refreshToken = undefined;
  }

  await user.save();

  return res.json(
    new ApiResponse(
      200,
      { user: { _id: user._id, name: user.name, isActive: user.isActive } },
      isActive ? "User unblocked successfully" : "User blocked successfully"
    )
  );
};

/**
 * @route   POST /api/users/forgot-password
 * @desc    Request a password reset link
 * @access  Public
 *
 * NOTE: Always returns 200 regardless of whether the email exists — this
 * prevents email enumeration (an attacker cannot tell if an account exists).
 * Actual email sending should be wired up once an email provider is configured.
 */
export const forgotPassword = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Look up user silently — never reveal whether the account exists
  const user = await User.findOne({ email });

  if (user && user.isActive) {
    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Generate the reset URL
    // Fallback to localhost:5173 if ALLOWED_ORIGINS is not strictly defined
    const clientUrl = process.env.ALLOWED_ORIGINS?.split(",")[0]?.trim() || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // TODO: Send an email via your email provider (e.g. SendGrid, Resend).
    console.log(`\n========================================================`);
    console.log(`[PASSWORD RESET REQUESTED]`);
    console.log(`Email: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`========================================================\n`);
  }

  // Always respond with the same message to prevent email enumeration
  return res.json(
    new ApiResponse(
      200,
      null,
      "If an account with that email exists, a password reset link has been sent.",
    ),
  );
};

/**
 * @route   PATCH /api/users/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  // Hash the incoming token to compare with the stored hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find user with matching token and valid expiry
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  // Hash the new password before saving
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  user.password = hashedPassword;
  
  // Clear the reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.json(
    new ApiResponse(200, null, "Password has been successfully reset"),
  );
};

