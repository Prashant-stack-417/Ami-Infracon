import { useState, useRef, useMemo, useEffect } from "react";
import anime from "animejs";
import {
  IconUser,
  IconMail,
  IconLock,
  IconPhone,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../app/UserContext";
import toast from "react-hot-toast";
import { VALIDATION } from "../config/constants";
import { handleApiError } from "../utils/errorHandler";
import { useIsMounted } from "../hooks/useCustomHooks";

/* ── Password strength calculator ── */
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const map = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-emerald-400" },
    { label: "Excellent", color: "bg-emerald-500" },
  ];
  return { score, ...map[score] };
};

const Register = () => {
  const navigate = useNavigate();
  const { loading } = useUserContext();
  const { setLoading } = useUserContext();
  const { register } = useUserContext();
  const isMounted = useIsMounted();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const refs = {
    name: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    password: useRef(null),
    confirm: useRef(null),
  };

  const strength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );

  useEffect(() => {
    anime({
      targets: ".register-hero",
      opacity: [0, 1],
      translateX: [-40, 0],
      duration: 800,
      easing: "easeOutQuint",
    });
    anime({
      targets: ".register-form-container",
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: "easeOutCubic",
      delay: 100,
    });
  }, []);

  /* ── Generic change handler ── */
  const onChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: "", form: "" }));
  };

  /* ── Validation ── */
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) errs.name = "Full name is required";
    else if (form.name.trim().length < 2) errs.name = "At least 2 characters";

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!VALIDATION.email.test(form.email))
      errs.email = "Invalid email format";
    else if (VALIDATION.adminEmail.test(form.email))
      errs.email = "Invalid email format";

    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!VALIDATION.phone.test(form.phone))
      errs.phone = "Invalid phone number";

    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < VALIDATION.password.minLength)
      errs.password = `At least ${VALIDATION.password.minLength} characters`;
    else if (!/[A-Z]/.test(form.password))
      errs.password = "Must include an uppercase letter";
    else if (!/[0-9]/.test(form.password))
      errs.password = "Must include a number";

    if (!form.confirm) errs.confirm = "Please confirm your password";
    else if (form.password !== form.confirm)
      errs.confirm = "Passwords do not match";

    setErrors(errs);

    // Focus the first error
    const firstError = Object.keys(errs)[0];
    if (firstError) refs[firstError]?.current?.focus();

    return Object.keys(errs).length === 0;
  };

  /* ── Geolocation ── */
  const requestLocation = async () => {
    if (!("geolocation" in navigator)) return null;

    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }),
      );
      return [pos.coords.longitude, pos.coords.latitude];
    } catch (err) {
      if (err?.code === 1) {
        setErrors((p) => ({
          ...p,
          form: "Location permission denied. Please allow access and try again.",
        }));
      } else {
        setErrors((p) => ({ ...p, form: "Unable to fetch location." }));
      }
      return null;
    }
  };

  /* ── Submit ── */
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const coords = await requestLocation();
    if (!coords) return;

    setLoading(true);
    try {
      await register(
        form.name,
        form.email,
        form.phone,
        form.password,
        coords,
      );
      if (isMounted.current) {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      }
    } catch (error) {
      if (isMounted.current) {
        handleApiError(error, { fallbackMessage: "Registration failed" });
        setErrors({
          form:
            error.response?.data?.message || "Registration failed. Try again.",
        });
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

  /* ── Field component ── */
  const Field = ({ id, label, icon: Icon, type = "text", field, ...rest }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={19} stroke={1.5} />
        </span>
        <input
          ref={refs[field]}
          id={id}
          type={type}
          value={form[field]}
          onChange={onChange(field)}
          className={`${inputBase} ${errors[field] ? inputError : inputNormal}`}
          {...rest}
        />
        {rest.children}
      </div>
      {errors[field] && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <IconAlertCircle size={14} /> {errors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 items-center justify-center p-12">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-md text-white register-hero opacity-0">
          <h2
            className="text-4xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Start your journey
            <br />
            with <span className="text-primary">Ami Infracon</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Create your account to order premium construction chemicals,
            track deliveries, and manage your business — all in one place.
          </p>

          {/* Feature highlights */}
          <div className="space-y-3">
            {[
              "Access 100+ construction chemicals",
              "Track orders in real-time",
              "Exclusive member pricing",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-white/60 text-sm">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/30">
                  <IconCheck size={13} className="text-primary" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-orange-100/50 to-white z-0" />
        <div className="w-full max-w-[500px] register-form-container opacity-0 glass-card p-8 sm:p-10 rounded-3xl border border-white/60 shadow-2xl relative z-10">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-6">
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ami <span className="text-primary">Infracon</span>
            </h2>
          </div>

          <div className="mb-7">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Create account
            </h1>
            <p className="text-gray-500 text-[15px]">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name + Email — 2-column on md */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                id="reg-name"
                label="Full name"
                icon={IconUser}
                field="name"
                placeholder="Your Name"
                autoComplete="name"
              />
              <Field
                id="reg-email"
                label="Email address"
                icon={IconMail}
                field="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Phone */}
            <Field
              id="reg-phone"
              label="Phone number"
              icon={IconPhone}
              field="phone"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />

            {/* Password + Confirm — 2-column on md */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <IconLock size={19} stroke={1.5} />
                  </span>
                  <input
                    ref={refs.password}
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={onChange("password")}
                    className={`${inputBase} pr-11 ${errors.password ? inputError : inputNormal}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide" : "Show"}
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

                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <IconLock size={19} stroke={1.5} />
                  </span>
                  <input
                    ref={refs.confirm}
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={onChange("confirm")}
                    className={`${inputBase} pr-11 ${errors.confirm ? inputError : inputNormal}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirm ? "Hide" : "Show"}
                  >
                    {showConfirm ? (
                      <IconEyeOff size={19} stroke={1.5} />
                    ) : (
                      <IconEye size={19} stroke={1.5} />
                    )}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <IconAlertCircle size={14} /> {errors.confirm}
                  </p>
                )}
              </div>
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
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <IconArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
