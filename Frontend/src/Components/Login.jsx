import { useState, useRef, useEffect } from "react";
import anime from "animejs";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../app/UserContext";
import toast from "react-hot-toast";
import apiClient from "../utils/apiClient";
import { useGoogleLogin } from "@react-oauth/google";
import { VALIDATION } from "../config/constants";
import { handleApiError } from "../utils/errorHandler";
import { useIsMounted } from "../hooks/useCustomHooks";
import { IconShieldLock } from "@tabler/icons-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const isMounted = useIsMounted();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    anime({
      targets: ".login-hero",
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 800,
      easing: "easeOutQuint",
    });
    anime({
      targets: ".login-form-container",
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: "easeOutCubic",
      delay: 100,
    });
  }, []);

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!VALIDATION.email.test(email)) errs.email = "Invalid email format";

    if (!password) errs.password = "Password is required";

    setErrors(errs);
    if (errs.email) emailRef.current?.focus();
    else if (errs.password) passwordRef.current?.focus();
    return Object.keys(errs).length === 0;
  };

  /* ── Submit — User Login Only ── */
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Clear any leftover admin session
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      window.dispatchEvent(new Event("admin-auth-change"));

      // Always send email in lowercase for case-insensitive matching
      const user = await login(email.toLowerCase().trim(), password);
      if (isMounted.current) {
        setUser(user);
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      if (isMounted.current) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;

        // Show specific lockout message
        if (status === 423) {
          setErrors({ form: msg || "Account temporarily locked. Try again later." });
          toast.error("Account locked. Too many failed attempts.");
        } else {
          setErrors({ form: msg || "Login failed. Please try again." });
          handleApiError(error, { fallbackMessage: "Login failed" });
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  /* ── Google OAuth ── */
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        window.dispatchEvent(new Event("admin-auth-change"));

        // Using implicit flow (access_token), get user profile first
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
        );
        const googleUser = await userInfoResponse.json();

        const response = await apiClient.post("/users/google-auth", {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          accessToken: tokenResponse.access_token,
        });

        const { user } = response.data.data;
        if (isMounted.current) {
          setUser(user);
          toast.success(response.data.message || "Login successful!");
          navigate("/dashboard");
        }
      } catch (error) {
        if (isMounted.current) {
          handleApiError(error, { fallbackMessage: "Google login failed" });
          setErrors({
            form: error.response?.data?.message || "Google login failed.",
          });
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    onError: () => {
      if (isMounted.current) {
        toast.error("Google login failed");
        setErrors({ form: "Google login failed. Please try again." });
      }
    },
  });

  /* ── Shared input classes ── */
  const inputBase =
    "w-full rounded-xl border bg-white/50 outline-none px-11 py-3.5 text-[15px] transition-all duration-200 placeholder:text-gray-400";
  const inputNormal =
    "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const inputError = "border-red-400 focus:border-red-500 focus:ring-red-200";

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 items-center justify-center p-12">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-md text-white login-hero opacity-0">
          <h2
            className="text-4xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Welcome back to
            <br />
            <span className="text-primary">Ami Infracon</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Access your dashboard, manage orders, and explore premium
            construction chemicals from a trusted source.
          </p>
          <div className="flex items-center gap-4 text-white/50 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Secure login
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              256-bit encryption
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-orange-100/50 to-white z-0" />
        <div className="w-full max-w-[460px] login-form-container opacity-0 glass-card p-8 sm:p-10 rounded-3xl border border-white/60 shadow-2xl relative z-10">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ami <span className="text-primary">Infracon</span>
            </h2>
          </div>

          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sign in
            </h1>
            <p className="text-gray-500 text-[15px]">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconMail size={19} stroke={1.5} />
                </span>
                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: "", form: "" }));
                  }}
                  className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <IconAlertCircle size={14} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconLock size={19} stroke={1.5} />
                </span>
                <input
                  ref={passwordRef}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "", form: "" }));
                  }}
                  className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <IconEyeOff size={19} stroke={1.5} />
                  ) : (
                    <IconEye size={19} stroke={1.5} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <IconAlertCircle size={14} /> {errors.password}
                </p>
              )}
            </div>

            {/* Form-level error */}
            {errors.form && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2 animate-in fade-in zoom-in-95">
                <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
                {errors.form}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full btn-primary text-white font-semibold py-3.5 text-[15px] shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <IconArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-7">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="px-4 text-xs text-gray-400 uppercase tracking-wider">
              or continue with
            </span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium py-3.5 text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            <IconBrandGoogle size={20} />
            Google
          </button>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Create account
            </Link>
          </p>


        </div>
      </div>
    </div>
  );
};

export default Login;
