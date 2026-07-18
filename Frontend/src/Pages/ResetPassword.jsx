import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import anime from "animejs";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import { IconLock, IconCheck, IconArrowLeft } from "@tabler/icons-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        targets: ".reset-panel",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".reset-icon",
        scale: [0, 1],
        duration: 800,
        delay: 200,
        easing: "easeOutElastic(1, .5)"
      });
    }
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch(`/users/reset-password/${token}`, { password });

      if (isMounted.current) {
        setSubmitted(true);
        toast.success("Password reset successfully!");
      }
    } catch (error) {
      if (isMounted.current) {
        handleApiError(error, {
          fallbackMessage: "Failed to reset password. The link may be expired.",
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
            <IconCheck size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-primary-content mb-4">
            Password Reset Complete
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You can now log in with your new password.
          </p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              Proceed to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full reset-panel opacity-0">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <IconArrowLeft size={20} />
          <span>Back to Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 reset-icon opacity-0 scale-50">
              <IconLock size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-primary-content mb-2">
              Set New Password
            </h1>
            <p className="text-gray-600 text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-content mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconLock size={20} />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-primary-content mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconLock size={20} />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="Confirm new password"
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
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
