/**
 * Decode JWT token without verification.
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

/**
 * Check if a JWT token is expired.
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp < Date.now() / 1000;
};

/**
 * Check and clear expired admin token from localStorage.
 * Returns true if admin token is valid.
 */
export const checkAdminSession = () => {
  const adminSession = localStorage.getItem("adminSession");
  if (!adminSession) return false;
  return true;
};
