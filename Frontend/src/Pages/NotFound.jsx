// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IconHome, IconArrowLeft, IconAlertTriangle } from "@tabler/icons-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-red-100 p-6 rounded-full">
            <IconAlertTriangle size={80} className="text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-9xl font-bold text-primary mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-primary-content mb-4"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-8 text-lg"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <IconHome size={20} />
            <span>Go Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-primary-content font-semibold rounded-lg border border-primary/20 transition-all duration-200 shadow hover:shadow-lg"
          >
            <IconArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold text-primary-content mb-3">
            Quick Links
          </h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Products
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
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
