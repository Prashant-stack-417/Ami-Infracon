import React from "react";
import { Link } from "react-router-dom";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";

const Navbar = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const COMPANY_NAME = {
    prefix: "Ami",
    main: "Infracon",
    suffix: "LLP",
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-black">
              {COMPANY_NAME.prefix}{" "}
              <span className="text-primary">{COMPANY_NAME.main}</span>{" "}
              <span className="text-primary">{COMPANY_NAME.suffix}</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-content transition-colors"
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-content transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary-content transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-content transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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
