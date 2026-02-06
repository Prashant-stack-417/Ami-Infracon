import React, { useEffect } from "react";
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
  const token = localStorage.getItem("adminToken");

  let admin = null;
  try {
    admin = adminStr ? JSON.parse(adminStr) : null;
  } catch (error) {
    console.error("Failed to parse admin data:", error);
  }

  useEffect(() => {
    if (!admin || !token) {
      toast.error("Please login to access this page");
    } else if (admin.role === "superadmin" || admin.isSuperAdmin) {
      toast.success("Redirecting to super admin dashboard");
    }
  }, [admin, token]);

  if (!admin || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (admin.role === "superadmin" || admin.isSuperAdmin) {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
