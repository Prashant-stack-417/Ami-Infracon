import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  IconUser,
  IconMail,
  IconLock,
  IconArrowRight,
  IconChecks,
  IconPhone,
} from "@tabler/icons-react";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const loading = useUserStore((s) => s.loading);
  const setLoading = useUserStore((s) => s.setLoading);
  const register = useUserStore((s) => s.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");

  // Refs for auto-focus on error
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const validate = () => {
    if (!name) {
      setError("Please enter your full name");
      nameRef.current?.focus();
      return false;
    }
    if (!email) {
      setError("Please enter your email address");
      emailRef.current?.focus();
      return false;
    }

    // Block admin email registration silently
    const isAdminEmail = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i.test(email);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk || isAdminEmail) {
      setError("Enter a valid email address");
      emailRef.current?.focus();
      return false;
    }
    if (!phone) {
      setError("Please enter your phone number");
      phoneRef.current?.focus();
      return false;
    }
    const phoneOk = /^\+?[1-9]\d{1,14}$/.test(phone);
    if (!phoneOk) {
      setError("Enter a valid phone number");
      phoneRef.current?.focus();
      return false;
    }
    if (!password) {
      setError("Please enter a password");
      passwordRef.current?.focus();
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      passwordRef.current?.focus();
      return false;
    }
    if (!confirm) {
      setError("Please confirm your password");
      confirmRef.current?.focus();
      return false;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      confirmRef.current?.focus();
      return false;
    }
    setError("");
    return true;
  };

  // Promisified geolocation request with best-effort re-prompt on submit
  const requestLocation = async () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser");
      return null;
    }

    const getPosition = (options) =>
      new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, options),
      );

    try {
      // Check permission state when available; still attempt request to trigger prompt
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({
            name: "geolocation",
          });
          // If denied, the browser may not show the prompt again; we still try and then surface guidance
          if (status.state === "denied") {
            // fall through to attempt; will error immediately in most browsers
          }
        } catch {
          /* no-op */
        }
      }

      const pos = await getPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
      const { latitude, longitude } = pos.coords;
      // Backend expects [longitude, latitude]
      const coords = [longitude, latitude];
      return coords;
    } catch (err) {
      if (err?.code === 1) {
        setError(
          "Location permission denied. Please allow location access and try again.",
        );
      } else if (err?.code === 3) {
        setError("Location request timed out. Please try again.");
      } else {
        setError("Unable to fetch location. Please try again.");
      }
      return null;
    }
  };

  const handleRetryLocation = async () => {
    const coords = await requestLocation();
    if (coords) {
      setError("");
      toast.success("Location acquired");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Ensure we have a fresh location and trigger prompt if needed
    const coords = await requestLocation();
    if (!coords) return; // stop if permission denied or failed
    setLoading(true);
    try {
      await register(name, email, phone, password, coords);
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Try again.",
      );
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 24, filter: "blur(6px)", scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const fieldVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 flex items-center justify-center px-4">
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-xl rounded-2xl border border-white/30 shadow-xl bg-white/70 backdrop-blur-sm"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-content">
              Create your
              <span className="text-secondary font-semibold">account </span>
            </h1>
          </div>

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              className="md:col-span-1"
            >
              <label
                htmlFor="name"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Full name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconUser size={20} />
                </span>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="Your Name"
                  autoComplete="name"
                />
              </div>
            </motion.div>

            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              className="md:col-span-1"
            >
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
            </motion.div>

            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              className="md:col-span-1"
            >
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Phone
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconPhone size={20} />
                </span>
                <input
                  ref={phoneRef}
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="+1234567890"
                  autoComplete="tel"
                />
              </div>
            </motion.div>

            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              className="md:col-span-1"
            >
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </motion.div>

            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              className="md:col-span-1"
            >
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Confirm password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconLock size={20} />
                </span>
                <input
                  ref={confirmRef}
                  id="confirm"
                  name="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </motion.div>

            {error && (
              <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={handleRetryLocation}
                  className="text-secondary font-semibold hover:text-secondary-dark underline underline-offset-2"
                >
                  Retry location
                </button>
              </div>
            )}

            <div className="md:col-span-2 flex justify-center items-center pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-content font-semibold px-6 py-3 shadow hover:bg-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Creating Account…" : "Create Account"}</span>
                <IconArrowRight size={18} />
              </motion.button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-secondary hover:text-secondary-dark font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
