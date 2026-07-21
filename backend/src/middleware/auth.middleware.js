import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable must be set");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET environment variable must be set");

// ── Shared helpers ──

const extractToken = (req) =>
  req.headers.authorization?.replace(/^Bearer /, "") ?? req.cookies?.accessToken ?? null;

const handleJwtError = (error, next) => {
  if (error.name === "JsonWebTokenError")
    return { status: 401, message: "Invalid access token" };
  if (error.name === "TokenExpiredError")
    return { status: 401, message: "Access token has expired" };
  return null; // let next(error) handle it
};

// ── Middleware ──

export const verifyToken = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw Object.assign(new Error("Access token is required"), { statusCode: 401 });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    const jwtErr = handleJwtError(error, next);
    if (jwtErr) return res.status(jwtErr.status).json({ success: false, message: jwtErr.message });
    next(error);
  }
};

export const verifyRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw Object.assign(new Error("Refresh token is required"), { statusCode: 401 });
    req.user = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    next();
  } catch (error) {
    const jwtErr = handleJwtError(error, next);
    if (jwtErr) return res.status(jwtErr.status).json({ success: false, message: jwtErr.message.replace("access", "refresh") });
    next(error);
  }
};

export const verifyAdminRefreshToken = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken;
    if (!refreshToken) throw Object.assign(new Error("Admin refresh token is required"), { statusCode: 401 });
    // Note: Admin uses ADMIN_JWT_SECRET for both access and refresh tokens in this simplified setup
    req.admin = jwt.verify(refreshToken, ADMIN_JWT_SECRET);
    next();
  } catch (error) {
    const jwtErr = handleJwtError(error, next);
    if (jwtErr) return res.status(jwtErr.status).json({ success: false, message: jwtErr.message.replace("access", "refresh") });
    next(error);
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(); // silently continue
  }
};

export const verifyAdminToken = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw Object.assign(new Error("Admin access token is required"), { statusCode: 401 });
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "superadmin")
      throw Object.assign(new Error("Admin access required"), { statusCode: 403 });
    req.admin = decoded;
    next();
  } catch (error) {
    const jwtErr = handleJwtError(error, next);
    if (jwtErr) return res.status(jwtErr.status).json({ success: false, message: `Admin ${jwtErr.message}` });
    next(error);
  }
};

export const verifySuperAdmin = (req, res, next) => {
  try {
    if (!req.admin) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
    if (req.admin.role !== "superadmin" && !req.admin.isSuperAdmin)
      throw Object.assign(new Error("Super admin access required"), { statusCode: 403 });
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyUserOrAdmin = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw Object.assign(new Error("Access token is required"), { statusCode: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    }

    req.user = decoded;
    if (decoded.role === "admin" || decoded.role === "superadmin") req.admin = decoded;
    next();
  } catch (error) {
    const jwtErr = handleJwtError(error, next);
    if (jwtErr) return res.status(jwtErr.status).json({ success: false, message: jwtErr.message });
    next(error);
  }
};
