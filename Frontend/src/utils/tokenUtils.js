/**
 * JWT Token Utility Functions
 * Helper functions to decode and validate JWT tokens
 */

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get time until token expiration in milliseconds
 * @param {string} token - JWT token string
 * @returns {number} Milliseconds until expiration, or 0 if expired/invalid
 */
export const getTokenExpiry = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;

  const currentTime = Date.now() / 1000;
  const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
  return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
};

/**
 * Check and clear expired admin token from localStorage
 * @returns {boolean} True if admin token is valid, false if expired/invalid
 */
export const checkAdminTokenExpiry = () => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) return false;

  if (isTokenExpired(adminToken)) {
    // Token expired - clear admin data
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("admin-auth-change"));
    return false;
  }

  return true;
};
