import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication for regular users only
 * Redirects to login if user is not authenticated
 * Redirects admins to their respective dashboards
 */
const ProtectedRoute = ({ children }) => {
  const user = useUserStore((s) => s.user);
  const location = useLocation();

  // Check if admin is logged in (admins are only in localStorage, not userStore)
  const adminData = localStorage.getItem("admin");
  const isAdmin = !!adminData;

  useEffect(() => {
    if (!user && !adminData) {
      toast.error("Please login to access this page");
    } else if (isAdmin) {
      toast.error("Admins should use the admin dashboard");
    }
  }, [user, adminData, isAdmin]);

  // Not authenticated
  if (!user && !adminData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin is logged in, redirect to appropriate admin dashboard
  if (isAdmin) {
    let admin = null;
    try {
      admin = JSON.parse(adminData);
    } catch {
      // Invalid admin data, clear and redirect to login
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      return <Navigate to="/login" replace />;
    }

    if (admin?.role === "superadmin" || admin?.isSuperAdmin) {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Authenticated regular user
  return children;
};

export default ProtectedRoute;
