import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * SuperAdminProtectedRoute Component
 * Wraps routes that require super admin authentication
 * Redirects to admin login if not authenticated or not a super admin
 */
const SuperAdminProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Get admin from localStorage
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
      toast.error("Please login as super admin to access this page");
    } else if (admin.role !== "superadmin" && !admin.isSuperAdmin) {
      toast.error("You do not have super admin permissions");
    }
  }, [admin, token]);

  // Not authenticated
  if (!admin || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not super admin
  if (admin.role !== "superadmin" && !admin.isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Authenticated and authorized as super admin
  return children;
};

export default SuperAdminProtectedRoute;
