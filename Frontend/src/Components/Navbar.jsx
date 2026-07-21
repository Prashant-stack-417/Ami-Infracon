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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const authRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
    if (navRef.current) {
      anime({
        targets: navRef.current,
        translateY: ["-100%", "0%"],
        opacity: [0, 1],
        duration: 800,
        easing: "easeOutExpo",
      });
    }

    if (logoRef.current) {
      anime({
        targets: logoRef.current,
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: 200,
        duration: 800,
        easing: "easeOutElastic(1, .6)",
      });
    }

    if (linksRef.current) {
      const links = linksRef.current.querySelectorAll("a");
      anime({
        targets: links,
        translateY: [-10, 0],
        opacity: [0, 1],
        delay: anime.stagger(60, { start: 400 }),
        duration: 600,
        easing: "easeOutCubic",
      });
    }

    if (authRef.current) {
      const items = authRef.current.querySelectorAll("a, button, span");
      anime({
        targets: items,
        translateX: [15, 0],
        opacity: [0, 1],
        delay: anime.stagger(60, { start: 500 }),
        duration: 600,
        easing: "easeOutCubic",
      });
    }
  }, []);

  // Animate mobile menu open/close
  useEffect(() => {
    if (isMobileMenuOpen) {
      anime({
        targets: mobileMenuRef.current,
        translateY: ["-10px", "0px"],
        opacity: [0, 1],
        duration: 300,
        easing: "easeOutCubic",
        begin: () => {
          if (mobileMenuRef.current) {
            mobileMenuRef.current.style.display = 'block';
          }
        }
      });
    } else if (mobileMenuRef.current && mobileMenuRef.current.style.display === 'block') {
      anime({
        targets: mobileMenuRef.current,
        translateY: [0, "-10px"],
        opacity: [1, 0],
        duration: 200,
        easing: "easeInCubic",
        complete: () => {
          if (mobileMenuRef.current) {
            mobileMenuRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false);
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

  const currentUser = admin || user;
  const isAdmin = !!admin;

  const getLogoLink = () => {
    if (!isAdmin) return "/";
    if (admin.role === "superadmin" || admin.isSuperAdmin) {
      return "/superadmin/dashboard";
    }
    return "/admin/dashboard";
  };

  const navLinkClass =
    "type-label text-gray-700 hover:text-black transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary after:to-orange-500 after:transition-all after:duration-300 hover:after:w-full";

  const renderNavLinks = (onClickAction = null) => (
    <>
      {!isAdmin && (
        <Link to="/" className={navLinkClass} onClick={onClickAction}>
          Home
        </Link>
      )}
      {currentUser && !isAdmin && (
        <>
          <Link to="/dashboard" className={navLinkClass} onClick={onClickAction}>
            Dashboard
          </Link>
          <Link to="/profile" className={navLinkClass} onClick={onClickAction}>
            Profile
          </Link>
        </>
      )}
      {isAdmin && admin.role !== "superadmin" && !admin.isSuperAdmin && (
        <>
          <Link to="/admin/dashboard" className={navLinkClass} onClick={onClickAction}>Dashboard</Link>
          <Link to="/admin/analytics" className={navLinkClass} onClick={onClickAction}>Analytics</Link>
          <Link to="/admin/orders" className={navLinkClass} onClick={onClickAction}>Orders</Link>
          <Link to="/admin/users" className={navLinkClass} onClick={onClickAction}>Users</Link>
          <Link to="/admin/products" className={navLinkClass} onClick={onClickAction}>Products</Link>
          <Link to="/admin/blogs" className={navLinkClass} onClick={onClickAction}>Blogs</Link>
        </>
      )}
      {isAdmin && (admin.role === "superadmin" || admin.isSuperAdmin) && (
        <>
          <Link to="/superadmin/dashboard" className={navLinkClass} onClick={onClickAction}>Dashboard</Link>
          <Link to="/admin/analytics" className={navLinkClass} onClick={onClickAction}>Analytics</Link>
          <Link to="/admin/orders" className={navLinkClass} onClick={onClickAction}>Orders</Link>
          <Link to="/admin/users" className={navLinkClass} onClick={onClickAction}>Users</Link>
          <Link to="/admin/products" className={navLinkClass} onClick={onClickAction}>Products</Link>
          <Link to="/admin/blogs" className={navLinkClass} onClick={onClickAction}>Blogs</Link>
          <Link to="/superadmin/create-admin" className={navLinkClass} onClick={onClickAction}>Admins</Link>
        </>
      )}
      {!isAdmin && (
        <>
          <Link to="/about" className={navLinkClass} onClick={onClickAction}>About</Link>
          <Link to="/blogs" className={navLinkClass} onClick={onClickAction}>Blogs</Link>
          <Link to="/contact" className={navLinkClass} onClick={onClickAction}>Contact</Link>
        </>
      )}
    </>
  );

  return (
    <nav
      ref={navRef}
      style={{ opacity: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ${
        scrolled
          ? "glass-card py-2 shadow-lg m-2 sm:m-4 rounded-2xl border border-white/40"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link ref={logoRef} to={getLogoLink()} className="flex items-center space-x-2 shrink-0">
            <span className="type-subtitle text-black text-xl tracking-tight">
              {COMPANY_INFO.name.prefix}{" "}
              <span className="text-gradient-primary font-bold">{COMPANY_INFO.name.main}</span>{" "}
              <span className="text-gradient-primary font-bold">{COMPANY_INFO.name.suffix}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div ref={linksRef} className="hidden lg:flex items-center justify-center space-x-8 flex-1 ml-10">
            {renderNavLinks()}
          </div>

          {/* Desktop Auth Buttons */}
          <div ref={authRef} className="hidden lg:flex items-center justify-end space-x-4 shrink-0">
            {!currentUser ? (
              <>
                <Link to="/login" className="type-label text-gray-600 hover:text-black transition-colors px-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary type-label px-5 py-2 rounded-full font-bold shadow-md">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="type-caption text-gray-700 hidden xl:block bg-gray-100/50 px-3 py-1.5 rounded-full border border-gray-200/50">
                  Welcome, <span className="font-bold">{currentUser.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="ml-1 text-primary font-semibold">
                      ({admin.role === "superadmin" || admin.isSuperAdmin ? "Super" : "Admin"})
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="type-label bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-full transition-all border border-gray-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100/50 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        ref={mobileMenuRef} 
        className="lg:hidden hidden absolute top-full left-0 right-0 mt-2 mx-4 glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/60 p-4"
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col space-y-4">
          {renderNavLinks(() => setIsMobileMenuOpen(false))}
          <div className="h-px bg-gray-200/50 w-full my-2"></div>
          
          {!currentUser ? (
            <div className="flex flex-col gap-3 pt-2">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/login" className="text-center py-2 type-label text-gray-700 bg-gray-50/50 rounded-xl">
                Login
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/register" className="btn-primary text-center py-2 rounded-xl">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <span className="type-caption text-gray-600 text-center">
                Signed in as <span className="font-bold">{currentUser.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="w-full text-center py-2 type-label bg-red-50 text-red-600 rounded-xl border border-red-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
