import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * AdminProtectedRoute Component
 * Wraps routes that require admin authentication
 * Redirects to the shared login page if not authenticated
 */
const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();

  const adminStr = localStorage.getItem("admin");
  const adminSession = localStorage.getItem("adminSession");

  let admin = null;
  try {
    admin = adminStr ? JSON.parse(adminStr) : null;
  } catch {
    // Ignore parse errors
  }

  useEffect(() => {
    if (!adminStr || !adminSession) {
      toast.error("Please login to access this page");
    }
  }, [adminStr, token]);

  if (!admin || !adminSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow both regular admins and super admins to access admin routes
  return children;
};

export default AdminProtectedRoute;
