import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import anime from "animejs";
import { COMPANY_INFO } from "../../config/constants";

const Footer = () => {
  const root = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleProductsClick = (e) => {
    e.preventDefault();
    const linkEl = e.currentTarget;

    // Ripple + highlight feedback on the link itself
    anime({
      targets: linkEl,
      color: ["#ef4444", "#4b5563"],
      scale: [1, 1.15, 1],
      duration: 500,
      easing: "easeOutElastic(1, .6)",
    });

    const smoothScrollTo = (targetY) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const obj = { progress: 0 };

      anime({
        targets: obj,
        progress: 1,
        duration: 900,
        easing: "easeInOutQuart",
        update: () => {
          window.scrollTo(0, startY + distance * obj.progress);
        },
      });
    };

    const scrollToSection = () => {
      const section = document.getElementById("products");
      if (section) {
        const offset =
          section.getBoundingClientRect().top + window.scrollY - 80;
        smoothScrollTo(offset);
      }
    };

    if (location.pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");
      setTimeout(scrollToSection, 200);
    }
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Staggered column reveal
          anime({
            targets: ".footer-col",
            opacity: [0, 1],
            translateY: [40, 0],
            duration: 800,
            delay: anime.stagger(150, { start: 100 }),
            easing: "easeOutElastic(1, .8)",
          });

          // Bottom section slide up
          anime({
            targets: ".footer-bottom",
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 700,
            delay: 600,
            easing: "easeOutCubic",
          });

          // Social icons scale-in with stagger
          anime({
            targets: ".footer-social",
            opacity: [0, 1],
            scale: [0, 1],
            rotate: [-90, 0],
            duration: 500,
            delay: anime.stagger(80, { start: 800 }),
            easing: "easeOutElastic(1, .8)",
          });

          // Decorative line grow
          anime({
            targets: ".footer-divider",
            scaleX: [0, 1],
            opacity: [0, 1],
            duration: 800,
            delay: 400,
            easing: "easeOutQuart",
          });

          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer ref={root} className="bg-gray-50 border-t border-gray-200 py-phi-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Newsletter Strip */}
        <div className="footer-col bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center gap-4 opacity-0">
          <div className="flex-1">
            <h4 className="type-label text-primary-content font-bold mb-1">Stay Updated</h4>
            <p className="type-caption text-gray-500">Get the latest product updates and industry news.</p>
          </div>
          <form
            className="flex gap-2 w-full sm:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 sm:w-64 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-phi-xl">
          {/* Contact Section */}
          <div className="footer-col opacity-0">
            <h3 className="type-subtitle text-primary-content mb-phi-lg">
              Please feel free to get in touch with us
            </h3>
          </div>

          {/* Quick Links Section */}
          <div className="footer-col flex items-start space-x-3 opacity-0">
            <div className="shrink-0 mt-1">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h4
                className="type-label text-primary-content mb-phi-xs"
                style={{ fontWeight: 600 }}
              >
                Quick Links
              </h4>
              <div className="flex flex-col gap-phi-xs">
                <Link
                  to="/about"
                  className="type-caption text-gray-600 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="type-caption text-gray-600 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
                <a
                  href="/#products"
                  onClick={handleProductsClick}
                  className="type-caption text-gray-600 hover:text-primary transition-colors"
                >
                  Products
                </a>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="footer-col flex items-start space-x-3 opacity-0">
            <div className="shrink-0 mt-1">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h4
                className="type-label text-primary-content mb-phi-xs"
                style={{ fontWeight: 600 }}
              >
                Our Location
              </h4>
              <p className="type-caption text-gray-600">
                Ahmedabad, Gujarat
                <br />
                India
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="footer-col flex items-start space-x-3 opacity-0">
            <div className="shrink-0 mt-1">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4
                className="type-label text-primary-content mb-phi-xs"
                style={{ fontWeight: 600 }}
              >
                How Can We Help?
              </h4>
              <div className="type-caption text-gray-600 space-y-1">
                <p>info@amiinfracon.com</p>
                <p>+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-divider border-t border-gray-200 origin-left opacity-0" />
        <div className="footer-bottom pt-8 opacity-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-4 md:mb-1">
              <img
                src="logo.png"
                className="h-15 w-30"
                alt={`${COMPANY_INFO.fullName} Logo`}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="type-subtitle text-black">
                {COMPANY_INFO.name.prefix}{" "}
                <span className="text-red-500">{COMPANY_INFO.name.main}</span>{" "}
                <span className="text-red-500">{COMPANY_INFO.name.suffix}</span>
              </span>
            </div>
            {/* Copyright */}
            <div className="type-caption text-gray-500 mb-4 md:mb-0">
              © {COMPANY_INFO.fullName} | All Rights Reserved
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="footer-social text-gray-400 hover:text-gray-600 transition-colors opacity-0"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="footer-social text-gray-400 hover:text-gray-600 transition-colors opacity-0"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="footer-social text-gray-400 hover:text-gray-600 transition-colors opacity-0"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="footer-social text-gray-400 hover:text-gray-600 transition-colors opacity-0"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
