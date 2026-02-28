import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IconMail,
    IconLock,
    IconEye,
    IconEyeOff,
    IconArrowRight,
    IconAlertCircle,
    IconShieldLock,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { VALIDATION } from "../config/constants";
import { handleApiError } from "../utils/errorHandler";
import { useIsMounted } from "../hooks/useCustomHooks";

const AdminLogin = () => {
    const navigate = useNavigate();
    const isMounted = useIsMounted();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

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

    /* ── Submit — Admin/SuperAdmin Login ── */
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            // Clear any existing user session
            const storedData = localStorage.getItem("zwb_user_store");
            if (storedData) {
                try {
                    const data = JSON.parse(storedData);
                    data.state.user = null;
                    localStorage.setItem("zwb_user_store", JSON.stringify(data));
                } catch {
                    /* ignore */
                }
            }

            const response = await axiosInstance.post("/admin/login", {
                email,
                password,
            });
            const { admin, accessToken } = response.data.data;

            localStorage.setItem("admin", JSON.stringify(admin));
            localStorage.setItem("adminToken", accessToken);
            window.dispatchEvent(new Event("admin-auth-change"));

            toast.success("Admin login successful!");

            // Route based on role
            if (admin.role === "superadmin" || admin.isSuperAdmin) {
                navigate("/superadmin/dashboard");
            } else {
                navigate("/admin/dashboard");
            }
        } catch (error) {
            if (isMounted.current) {
                const msg =
                    error.response?.data?.message || "Admin login failed. Please try again.";
                setErrors({ form: msg });
                handleApiError(error, { fallbackMessage: "Admin login failed" });
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    /* ── Shared input classes ── */
    const inputBase =
        "w-full rounded-xl border bg-white/50 outline-none px-11 py-3.5 text-[15px] transition-all duration-200 placeholder:text-gray-400";
    const inputNormal =
        "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20";
    const inputError = "border-red-400 focus:border-red-500 focus:ring-red-200";

    return (
        <div className="min-h-screen flex">
            {/* ── Left Panel — Admin Branding ── */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 items-center justify-center p-12">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative z-10 max-w-md text-white"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <IconShieldLock size={28} className="text-yellow-400" />
                        </div>
                        <span className="text-yellow-400/80 text-sm font-medium uppercase tracking-wider">
                            Admin Portal
                        </span>
                    </div>
                    <h2
                        className="text-4xl font-bold leading-tight mb-6"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Administration
                        <br />
                        <span className="text-yellow-400">Dashboard</span>
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                        Manage users, products, orders, and platform settings.
                        Restricted to authorized administrators only.
                    </p>
                    <div className="flex items-center gap-4 text-white/40 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-yellow-400" />
                            Admin access only
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            Audit logged
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* ── Right Panel — Form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-gray-50 to-white">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[420px]"
                >
                    {/* Mobile branding */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2 text-gray-900">
                            <IconShieldLock size={24} className="text-yellow-500" />
                            <span className="text-lg font-bold">Admin Portal</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1
                            className="text-3xl font-bold text-gray-900 mb-2"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Admin Sign in
                        </h1>
                        <p className="text-gray-500 text-[15px]">
                            Enter your admin credentials to access the dashboard
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="admin-email"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Admin email
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <IconMail size={19} stroke={1.5} />
                                </span>
                                <input
                                    ref={emailRef}
                                    id="admin-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors((p) => ({ ...p, email: "", form: "" }));
                                    }}
                                    className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                                    placeholder="admin@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                                    >
                                        <IconAlertCircle size={14} /> {errors.email}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="admin-password"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <IconLock size={19} stroke={1.5} />
                                </span>
                                <input
                                    ref={passwordRef}
                                    id="admin-password"
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
                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                                    >
                                        <IconAlertCircle size={14} /> {errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Form-level error */}
                        <AnimatePresence>
                            {errors.form && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2"
                                >
                                    <IconAlertCircle size={18} className="mt-0.5 shrink-0" />
                                    {errors.form}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white font-semibold py-3.5 text-[15px] shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 hover:bg-gray-800 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <IconShieldLock size={18} />
                                    Admin Sign In
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* User login link */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Not an admin?{" "}
                        <Link
                            to="/login"
                            className="text-primary hover:text-primary-dark font-semibold transition-colors"
                        >
                            User login
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;
