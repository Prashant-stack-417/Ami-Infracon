import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../app/UserContext";
import toast from "react-hot-toast";
import anime from "animejs";
import { COMPANY_INFO } from "../config/constants";

const Navbar = () => {
  const { user } = useUserContext();
  const { logout } = useUserContext();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const authRef = useRef(null);

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

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mount animations
  useEffect(() => {
    // 1. Navbar slides down from -100%
    if (navRef.current) {
      anime({
        targets: navRef.current,
        translateY: ["-100%", "0%"],
        opacity: [0, 1],
        duration: 600,
        easing: "easeOutExpo",
      });
    }

    // 2. Logo pops in with a spring bounce
    if (logoRef.current) {
      anime({
        targets: logoRef.current,
        scale: [0.6, 1],
        opacity: [0, 1],
        delay: 300,
        duration: 700,
        easing: "spring(1, 80, 12, 0)",
      });
    }

    // 3. Nav links stagger slide-in from top
    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll("a");
      anime({
        targets: links,
        translateY: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(80, { start: 400 }),
        duration: 500,
        easing: "easeOutCubic",
      });
    }

    // 4. Auth buttons fade + slide in from right
    if (authRef.current) {
      const items = authRef.current.querySelectorAll("a, button, span");
      anime({
        targets: items,
        translateX: [24, 0],
        opacity: [0, 1],
        delay: anime.stagger(80, { start: 500 }),
        duration: 500,
        easing: "easeOutCubic",
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Navigate away from protected route BEFORE clearing user state
      // This prevents ProtectedRoute from showing "Please login" toast
      navigate("/login");
      await logout();
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
    "type-label text-gray-700 hover:text-primary-content transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full";

  return (
    <nav
      ref={navRef}
      style={{ opacity: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled
          ? "border-gray-300 shadow-md"
          : "border-gray-200 shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link ref={logoRef} to={getLogoLink()} className="flex items-center space-x-2" style={{ opacity: 0 }}>
            <span className="type-subtitle text-black">
              {COMPANY_INFO.name.prefix}{" "}
              <span className="text-primary">{COMPANY_INFO.name.main}</span>{" "}
              <span className="text-primary">{COMPANY_INFO.name.suffix}</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div ref={linksRef} className="hidden md:flex items-center space-x-8">
            {!isAdmin && (
              <Link to="/" className={navLinkClass}>
                Home
              </Link>
            )}
            {currentUser && !isAdmin && (
              <>
                <Link to="/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/profile" className={navLinkClass}>
                  Profile
                </Link>
              </>
            )}
            {/* Regular Admin Links */}
            {isAdmin && admin.role !== "superadmin" && !admin.isSuperAdmin && (
              <>
                <Link to="/admin/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/admin/analytics" className={navLinkClass}>
                  Analytics
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
                <Link to="/admin/blogs" className={navLinkClass}>
                  Blogs
                </Link>
              </>
            )}
            {/* Super Admin Links */}
            {isAdmin && (admin.role === "superadmin" || admin.isSuperAdmin) && (
              <>
                <Link to="/superadmin/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/admin/analytics" className={navLinkClass}>
                  Analytics
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
                <Link to="/admin/blogs" className={navLinkClass}>
                  Blogs
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
                <Link to="/blogs" className={navLinkClass}>
                  Blogs
                </Link>
                <Link to="/contact" className={navLinkClass}>
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div ref={authRef} className="flex items-center space-x-4">
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
