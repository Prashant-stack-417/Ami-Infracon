import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useGoogleLogin } from "@react-oauth/google";
import { VALIDATION } from "../config/constants";
import { handleApiError } from "../utils/errorHandler";
import { useIsMounted } from "../hooks/useCustomHooks";

const Login = () => {
  const navigate = useNavigate();
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const login = useUserStore((s) => s.login);
  const setUser = useUserStore((s) => s.setUser);
  const loading = useUserStore((s) => s.loading);
  const setLoading = useUserStore((s) => s.setLoading);
  const isMounted = useIsMounted();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Refs for auto-focus on error
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validate = () => {
    if (!email) {
      setError("Please enter your email address");
      emailRef.current?.focus();
      return false;
    }
    const emailOk = VALIDATION.email.test(email);
    if (!emailOk) {
      setError("Enter a valid email address");
      emailRef.current?.focus();
      return false;
    }
    if (!password) {
      setError("Please enter your password");
      passwordRef.current?.focus();
      return false;
    }
    setError("");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Check if email is admin format (username.Admin@gmail.com)
      const isAdminEmail = VALIDATION.adminEmail.test(email);

      if (isAdminEmail) {
        // Admin/Super Admin login
        const response = await axiosInstance.post("/admin/login", {
          email,
          password,
        });

        const { admin, accessToken } = response.data.data;

        // Store admin data and token in localStorage (admins are NOT stored in userStore)
        localStorage.setItem("admin", JSON.stringify(admin));
        localStorage.setItem("adminToken", accessToken);
        window.dispatchEvent(new Event("admin-auth-change"));

        toast.success("Login successful!");

        // Route based on admin role:
        // - superadmin → /superadmin/dashboard
        // - admin → /admin/dashboard
        if (admin.role === "superadmin" || admin.isSuperAdmin) {
          navigate("/superadmin/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
        return;
      } else {
        // Regular user login
        // Ensure any leftover admin session is cleared when signing in as a regular user
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        window.dispatchEvent(new Event("admin-auth-change"));

        const user = await login(email, password);

        if (isMounted.current) {
          setUser(user);
          toast.success("Login successful!");
          // Redirect regular users to their dashboard
          navigate("/dashboard");
        }
        return;
      }
    } catch (error) {
      if (isMounted.current) {
        const errorMessage =
          error.response?.data?.message || "Login failed. Please try again.";
        setError(errorMessage);
        handleApiError(error, {
          fallbackMessage: "Login failed",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Clear any admin session
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        window.dispatchEvent(new Event("admin-auth-change"));

        // Get user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        const googleUser = await userInfoResponse.json();

        // Send to backend for authentication
        const response = await axiosInstance.post("/users/google-auth", {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          accessToken: tokenResponse.access_token,
        });

        const { user } = response.data.data;

        if (isMounted.current) {
          // Store user in the store
          setUser(user);
          toast.success(response.data.message || "Login successful!");
          navigate("/dashboard");
        }
      } catch (error) {
        if (isMounted.current) {
          handleApiError(error, {
            fallbackMessage: "Google login failed",
          });
          setError(
            error.response?.data?.message || "Google login failed. Try again.",
          );
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    onError: () => {
      if (isMounted.current) {
        toast.error("Google login failed");
        setError("Google login failed. Please try again.");
      }
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 flex items-center justify-center px-4">
      {/* Card container with subtle entrance */}
      <MotionDiv
        initial={{ opacity: 0, y: 20, filter: "blur(6px)", scale: 0.98 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-white/30 shadow-xl bg-white/70 backdrop-blur-sm"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-content">
              Welcome back
            </h1>
            <p className="text-sm text-gray-600 mt-1">Log in to your account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconMail size={20} />
                </span>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconLock size={20} />
                </span>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-content/60 hover:text-primary-content"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <IconEyeOff size={20} />
                  ) : (
                    <IconEye size={20} />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-secondary hover:text-secondary-dark font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <MotionButton
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-4 bg-primary text-primary-content hover:bg-primary-dark py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl"
            >
              <span>{loading ? "Signing in…" : "Sign In"}</span>
              <IconArrowRight size={18} />
            </MotionButton>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <span className="h-px w-full bg-primary-content/10" />
              <span className="px-3 text-xs text-gray-500">or</span>
              <span className="h-px w-full bg-primary-content/10" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                type="button"
                className="w-full rounded-lg border border-primary-content/20 text-primary-content py-3 font-medium hover:bg-primary/10"
                onClick={() => googleLogin()}
              >
                Continue with Google
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            New here?{" "}
            <Link
              to="/register"
              className="text-secondary hover:text-secondary-dark font-semibold"
            >
              Create account
            </Link>
          </p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Login;
