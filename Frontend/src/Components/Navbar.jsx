import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";
import { COMPANY_INFO } from "../config/constants";

const Navbar = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [admin, setAdmin] = useState(null);

  // Check for admin in localStorage and listen for admin auth changes
  useEffect(() => {
    const checkAdmin = () => {
      const adminStr = localStorage.getItem("admin");
      try {
        setAdmin(adminStr ? JSON.parse(adminStr) : null);
      } catch {
        setAdmin(null);
      }
    };

    checkAdmin();
    window.addEventListener("admin-auth-change", checkAdmin);
    return () => window.removeEventListener("admin-auth-change", checkAdmin);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Clear any admin session data as well
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("admin-auth-change"));

      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Determine current logged-in entity (user or admin)
  const currentUser = admin || user;
  const isAdmin = !!admin;

  // Determine the logo link based on user type
  const getLogoLink = () => {
    if (!isAdmin) return "/";
    if (admin.role === "superadmin" || admin.isSuperAdmin) {
      return "/superadmin/dashboard";
    }
    return "/admin/dashboard";
  };

  const navLinkClass =
    "type-label text-gray-700 hover:text-primary-content transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getLogoLink()} className="flex items-center space-x-2">
            <span className="type-subtitle text-black">
              {COMPANY_INFO.name.prefix}{" "}
              <span className="text-primary">{COMPANY_INFO.name.main}</span>{" "}
              <span className="text-primary">{COMPANY_INFO.name.suffix}</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAdmin && (
              <Link to="/" className={navLinkClass}>
                Home
              </Link>
            )}
            {currentUser && !isAdmin && (
              <Link to="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
            )}
            {/* Regular Admin Links */}
            {isAdmin && admin.role !== "superadmin" && !admin.isSuperAdmin && (
              <>
                <Link to="/admin/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/admin/orders" className={navLinkClass}>
                  Orders
                </Link>
                <Link to="/admin/users" className={navLinkClass}>
                  Users
                </Link>
                <Link to="/admin/products" className={navLinkClass}>
                  Products
                </Link>
              </>
            )}
            {/* Super Admin Links */}
            {isAdmin && (admin.role === "superadmin" || admin.isSuperAdmin) && (
              <>
                <Link to="/superadmin/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/admin/orders" className={navLinkClass}>
                  Orders
                </Link>
                <Link to="/admin/users" className={navLinkClass}>
                  Users
                </Link>
                <Link to="/admin/products" className={navLinkClass}>
                  Products
                </Link>
                <Link to="/superadmin/create-admin" className={navLinkClass}>
                  Admins
                </Link>
              </>
            )}
            {!isAdmin && (
              <>
                <Link to="/about" className={navLinkClass}>
                  About
                </Link>
                <Link to="/contact" className={navLinkClass}>
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  className="type-label text-gray-700 hover:text-black transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="type-label bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="type-caption text-gray-700">
                  Welcome, {currentUser.name}
                  {isAdmin && (
                    <span className="ml-1 type-overline text-primary">
                      (
                      {admin.role === "superadmin" || admin.isSuperAdmin
                        ? "Super Admin"
                        : "Admin"}
                      )
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="type-label bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
