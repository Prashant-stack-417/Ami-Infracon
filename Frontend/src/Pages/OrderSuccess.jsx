import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import useUserStore from "../app/userStore";
import {
  IconCircleCheck,
  IconHome,
  IconPackage,
  IconReceipt,
} from "@tabler/icons-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useUserStore();
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Clear cart after successful order
    if (orderData) {
      clearCart();
    }
  }, [orderData, clearCart]);

  // Redirect to home if accessed without order data
  useEffect(() => {
    if (!orderData) {
      navigate("/", { replace: true });
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center">
              <IconCircleCheck size={60} className="text-green-600" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-primary-content mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your order. We've received your request and will
              process it shortly.
            </p>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-lg p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <IconReceipt size={24} className="text-primary" />
              <h2 className="text-xl font-semibold text-primary-content">
                Order Details
              </h2>
            </div>

            <div className="space-y-3">
              {orderData._id && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-primary-content">
                    #{orderData._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              )}

              {orderData.title && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Order Title:</span>
                  <span className="font-semibold text-primary-content">
                    {orderData.title}
                  </span>
                </div>
              )}

              {orderData.quantity && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-primary-content">
                    {orderData.quantity}
                  </span>
                </div>
              )}

              {orderData.address && (
                <div className="flex justify-between items-start py-2 border-b border-gray-200">
                  <span className="text-gray-600">Delivery Address:</span>
                  <span className="font-semibold text-primary-content text-right max-w-xs">
                    {orderData.address}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  <IconPackage size={16} />
                  <span>Processing</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
          >
            <h3 className="font-semibold text-primary-content mb-3">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>
                  Our team will review your order and contact you for
                  confirmation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>You'll receive updates via email about your order status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>
                  Track your order anytime from your dashboard
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>
                  For any queries, feel free to contact our support team
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <IconPackage size={20} />
              <span>View Orders</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-primary-content font-semibold rounded-lg border border-primary/20 transition-all duration-200 shadow hover:shadow-lg"
            >
              <IconHome size={20} />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link
                to="/contact"
                className="text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Confetti Animation Effect (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500">
            Order confirmation email has been sent to your registered email
            address
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
