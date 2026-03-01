import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import anime from "animejs";
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
  const clearCartLocal = useUserStore((s) => s.clearCartLocal);
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Clear cart after successful order
    if (orderData) {
      clearCartLocal();
    }
  }, [orderData, clearCartLocal]);

  // Redirect to home if accessed without order data
  useEffect(() => {
    if (!orderData) {
      navigate("/", { replace: true });
    }
  }, [orderData, navigate]);

  useEffect(() => {
    if (orderData) {
      anime({
        targets: ".os-card",
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".os-child",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(150, { start: 200 }),
        duration: 500,
        easing: "easeOutCubic"
      });
    }
  }, [orderData]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 pt-20">
      <div className="max-w-2xl w-full os-card opacity-0">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6 os-child opacity-0">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center">
              <IconCircleCheck size={60} className="text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8 os-child opacity-0">
            <h1 className="text-3xl font-bold text-primary-content mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your order. We've received your request and will
              process it shortly.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 os-child opacity-0">
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
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 os-child opacity-0">
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
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 os-child opacity-0">
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
          </div>

          {/* Contact Support */}
          <div className="mt-6 text-center os-child opacity-0">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <Link
                to="/contact"
                className="text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Confetti Animation Effect (Optional) */}
        <div className="mt-6 text-center os-child opacity-0">
          <p className="text-sm text-gray-500">
            Order confirmation email has been sent to your registered email
            address
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
