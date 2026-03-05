/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 * @module middleware/auth
 */

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

// ── Validate secrets at import time ──
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}
if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable must be set");
}

/**
 * Verify JWT access token from cookies or Authorization header
 * Attaches user information to req.user if valid
 */
export const verifyToken = (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new ApiError(401, "Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired",
      });
    }
    next(error);
  }
};

/**
 * Verify refresh token from cookies
 * Used for token refresh endpoint
 */
export const verifyRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
      });
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Silently continue without user info
    next();
  }
};

/**
 * Verify admin token from cookies or Authorization header
 * Attaches admin information to req.admin if valid
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      token = req.cookies?.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Admin access token is required");
    }

    // Verify token with admin secret
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    // Attach admin info to request
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin access token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin access token has expired",
      });
    }
    next(error);
  }
};

/**
 * Verify super admin role
 * Must be used after verifyAdminToken
 */
export const verifySuperAdmin = (req, res, next) => {
  try {
    if (!req.admin) {
      throw new ApiError(401, "Authentication required");
    }

    if (req.admin.role !== "superadmin" && !req.admin.isSuperAdmin) {
      throw new ApiError(403, "Super admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify token from either user or admin
 * Accepts both user and admin tokens, normalizes to req.user
 * Useful for endpoints that can be accessed by both
 */
export const verifyUserOrAdmin = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new ApiError(401, "Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Normalize to req.user regardless of whether it's user or admin
    req.user = decoded;

    // Also set req.admin if it's an admin token
    if (decoded.role === "admin" || decoded.role === "superadmin") {
      req.admin = decoded;
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired",
      });
    }
    next(error);
  }
};
