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


import { sendEmail } from "../utils/sendEmail.js";

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
  if (typeof req.body.email !== "string") {
    throw Object.assign(new Error("Email must be a valid string"), { statusCode: 400 });
  }
  const email = req.body.email.toLowerCase().trim();

  // Check if user already exists (case-insensitive — email already lowered)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw Object.assign(new Error("User with this email already exists"), { statusCode: 409 });
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
      { success: true, data: { user: userResponse }, message: "User registered successfully" },
    );
};

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
export const login = async (req, res) => {
  const { password } = req.body;
  if (typeof req.body.email !== "string") {
    throw Object.assign(new Error("Email must be a valid string"), { statusCode: 400 });
  }
  const email = req.body.email.toLowerCase().trim();

  // Find user and include password + lockout fields
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  if (!user) {
    // Timing-safe: hash a dummy password so response time is consistent
    await bcrypt.hash("dummy", BCRYPT_SALT_ROUNDS);
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  // Check if account is locked
  if (user.isLocked) {
    const minutesLeft = Math.ceil(
      (user.lockUntil - Date.now()) / 60000,
    );
    throw Object.assign(new Error(`Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`), { statusCode: 423 });
  }

  // Check if user is active
  if (!user.isActive) {
    throw Object.assign(new Error("Account is deactivated. Please contact support."), { statusCode: 403 });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    // Increment failed attempts (may lock the account)
    await user.incLoginAttempts();
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
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
    { success: true, data: { user: userResponse }, message: "Login successful" },
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
        throw Object.assign(new Error("Invalid Google access token"), { statusCode: 401 });
      }

      const googleUser = await response.json();
      userEmail = googleUser.email;
      userName = name || googleUser.name;
    } else {
      throw Object.assign(new Error("Google credential or access token is required"), { statusCode: 400 });
    }

    if (!userEmail) {
      throw Object.assign(new Error("Email not provided by Google"), { statusCode: 400 });
    }

    // Check if user exists
    let user = await User.findOne({ email: userEmail.toLowerCase() });

    if (user) {
      // User exists, log them in
      // Check if user is active
      if (!user.isActive) {
        throw Object.assign(new Error("Account is deactivated. Please contact support."), { statusCode: 403 });
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

    return res.json({
      success: true,
      data: { user: userResponse, accessToken: jwtAccessToken },
      message: user.createdAt.getTime() === user.updatedAt.getTime()
        ? "Account created successfully"
        : "Login successful"
    });
  } catch (error) {
    // Handle Google verification errors
    if (error.name === "ApiError") {
      throw error;
    }
    throw Object.assign(new Error("Invalid Google token"), { statusCode: 401 });
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
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }

  // Find user and verify refresh token
  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  // Verify the refresh token matches the one in database
  const refreshTokenFromCookie = req.cookies?.refreshToken;
  if (!refreshTokenFromCookie || user.refreshToken !== refreshTokenFromCookie) {
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }

  // Generate new tokens
  const accessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save();

  // Set new cookies
  setTokenCookies(res, accessToken, newRefreshToken);

  return res.json({ success: true, data: null, message: "Token refreshed successfully" });
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

  return res.json({ success: true, data: null, message: "Logout successful" });
};

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  // Check if user is active
  if (!user.isActive) {
    throw Object.assign(new Error("Account is deactivated"), { statusCode: 403 });
  }

  const userResponse = user.toJSON();

  return res.json(
    { success: true, data: { user: userResponse }, message: "User profile retrieved" },
  );
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  const { name, phone, defaultAddress } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (defaultAddress) {
    user.defaultAddress = {
      ...user.defaultAddress,
      ...defaultAddress
    };
  }

  await user.save();
  const userResponse = user.toJSON();

  return res.json(
    { success: true, data: { user: userResponse }, message: "Profile updated successfully" },
  );
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password -refreshToken").lean();

  return res.json({
    success: true,
    data: { users, total: users.length },
    message: "Users retrieved successfully"
  });
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
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  await User.findByIdAndDelete(id);

  return res.json({ success: true, data: null, message: "User deleted successfully" });
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
    throw Object.assign(new Error("isActive must be true or false"), { statusCode: 400 });
  }

  const user = await User.findById(id).select("+refreshToken");

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  user.isActive = isActive;

  // Invalidate all active sessions immediately when blocking
  if (!isActive) {
    user.refreshToken = undefined;
  }

  await user.save();

  return res.json({
    success: true,
    data: { user: { _id: user._id, name: user.name, isActive: user.isActive } },
    message: isActive ? "User unblocked successfully" : "User blocked successfully"
  });
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
  if (!req.body.email || typeof req.body.email !== "string") {
    throw Object.assign(new Error("Email is required and must be a valid string"), { statusCode: 400 });
  }
  const email = req.body.email.toLowerCase().trim();

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

    // Send actual email via Nodemailer
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 16px;">Hello,</p>
        <p style="color: #334155; font-size: 16px;">We received a request to reset the password for the Ami Infracon account associated with <strong>${email}</strong>.</p>
        <p style="color: #334155; font-size: 16px;">If you made this request, please click the button below to securely set a new password. This link will expire in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
      </div>
    `;

    // Fire and forget (don't block the response)
    sendEmail({
      to: email,
      subject: "Ami Infracon - Password Reset Request",
      html: emailHtml
    });
  }

  // Always respond with the same message to prevent email enumeration
  return res.json(
    { success: true, data: null, message: "If an account with that email exists, a password reset link has been sent." },
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
    throw Object.assign(new Error("Password must be at least 6 characters long"), { statusCode: 400 });
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
    throw Object.assign(new Error("Invalid or expired password reset token"), { statusCode: 400 });
  }

  // Hash the new password before saving
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  user.password = hashedPassword;
  
  // Clear the reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.json(
    { success: true, data: null, message: "Password has been successfully reset" },
  );
};

