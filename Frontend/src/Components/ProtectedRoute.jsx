import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "../app/UserContext";
import toast from "react-hot-toast";

const HYDRATE_TIMEOUT_MS = 8000;

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication for regular users only
 * Redirects to login if user is not authenticated
 * Redirects admins to their respective dashboards
 *
 * On mount, calls hydrate() to refresh expired HTTP-only cookies so that
 * subsequent API calls don't fail with 401.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useUserContext();
  const { hydrate } = useUserContext();
  const location = useLocation();
  const [isHydrating, setIsHydrating] = useState(true);

  // Check if admin is logged in (admins are only in localStorage, not userStore)
  const adminData = localStorage.getItem("admin");
  const isAdmin = !!adminData;

  // Proactively refresh tokens before rendering protected content
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prevent an infinite spinner if refresh/me requests never settle.
        await Promise.race([
          hydrate(),
          new Promise((resolve) => setTimeout(resolve, HYDRATE_TIMEOUT_MS)),
        ]);
      } catch {
        // hydrate already clears the user on failure
      } finally {
        if (mounted) setIsHydrating(false);
      }
    })();
    return () => { mounted = false; };
  }, [hydrate]);

  useEffect(() => {
    if (isHydrating) return; // wait until hydration finishes
    if (!user && !adminData) {
      toast.error("Please login to access this page");
    } else if (isAdmin) {
      toast.error("Admins should use the admin dashboard");
    }
  }, [user, adminData, isAdmin, isHydrating]);

  // Show a loading spinner while verifying the session
  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
