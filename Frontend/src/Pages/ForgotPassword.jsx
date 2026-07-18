import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import anime from "animejs";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import { VALIDATION } from "../config/constants";
import { IconMail, IconArrowLeft, IconKey } from "@tabler/icons-react";

const ForgotPassword = () => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Initial mount animations
    if (submitted) {
      anime({
        targets: ".success-panel",
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".success-icon",
        scale: [0, 1],
        duration: 800,
        delay: 200,
        easing: "easeOutElastic(1, .5)"
      });
    } else {
      anime({
        targets: ".forgot-panel",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".forgot-icon",
        scale: [0, 1],
        duration: 800,
        delay: 200,
        easing: "easeOutElastic(1, .5)"
      });
      anime({
        targets: ".forgot-note",
        opacity: [0, 1],
        duration: 500,
        delay: 500,
        easing: "easeOutQuad"
      });
    }
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!VALIDATION.email.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/users/forgot-password", { email });

      if (isMounted.current) {
        setSubmitted(true);
        toast.success("Password reset link sent to your email!");
      }
    } catch (error) {
      if (isMounted.current) {
        handleApiError(error, {
          fallbackMessage: "Failed to send reset link. Please try again.",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center success-panel opacity-0">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 success-icon opacity-0">
            <IconMail size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-primary-content mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. Please
            check your inbox and follow the instructions.
          </p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              Back to Login
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-200"
            >
              Try Different Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full forgot-panel opacity-0">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <IconArrowLeft size={20} />
          <span>Back to Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 forgot-icon opacity-0 scale-50">
              <IconKey size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-primary-content mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-sm">
              No worries! Enter your email and we'll send you reset instructions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-content mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconMail size={20} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg forgot-note opacity-0">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> If you don't receive an email within a few
            minutes, please check your spam folder or try again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
