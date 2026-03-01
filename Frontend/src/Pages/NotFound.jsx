import { useEffect } from "react";
import anime from "animejs";
import { Link, useNavigate } from "react-router-dom";
import { IconHome, IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react";

const NotFound = () => {
  const navigate = useNavigate();

  // Determine home destination based on current session
  const getHomeDestination = () => {
    try {
      const adminStr = localStorage.getItem("admin");
      const token = localStorage.getItem("adminToken");
      if (adminStr && token) {
        const admin = JSON.parse(adminStr);
        if (admin.role === "superadmin" || admin.isSuperAdmin) {
          return "/superadmin/dashboard";
        }
        return "/admin/dashboard";
      }
    } catch { /* ignore */ }
    return "/";
  };

  const homeDest = getHomeDestination();
  useEffect(() => {
    anime({
      targets: ".notfound-main",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: "easeOutCubic"
    });

    anime({
      targets: ".notfound-item",
      opacity: [0, 1],
      translateY: [10, 0],
      delay: anime.stagger(100, { start: 200 }),
      duration: 500,
      easing: "easeOutCubic"
    });
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center notfound-main opacity-0">
        <div className="mb-8 flex justify-center notfound-item opacity-0">
          <div className="bg-red-100 p-6 rounded-full scale-100">
            <IconAlertTriangle size={80} className="text-primary" />
          </div>
        </div>

        <h1 className="text-9xl font-bold text-primary mb-4 notfound-item opacity-0">
          404
        </h1>

        <h2 className="text-3xl font-bold text-primary-content mb-4 notfound-item opacity-0">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8 text-lg notfound-item opacity-0">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center notfound-item opacity-0">
          <button
            onClick={() => navigate(homeDest)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <IconHome size={20} />
            <span>Go Home</span>
          </button>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-primary-content font-semibold rounded-lg border border-primary/20 transition-all duration-200 shadow hover:shadow-lg"
          >
            <IconArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-lg notfound-item opacity-0">
          <h3 className="text-lg font-semibold text-primary-content mb-3">
            Quick Links
          </h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to={homeDest}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {homeDest === "/" ? "Products" : "Dashboard"}
            </Link>
            <Link
              to="/about"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
