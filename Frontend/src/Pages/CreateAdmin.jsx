import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../utils/apiClient";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import { VALIDATION } from "../config/constants";
import {
  IconMail,
  IconLock,
  IconUser,
  IconArrowLeft,
  IconShieldCheck,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return false;
    }

    // Validate admin email format: username.Admin@gmail.com
    if (!VALIDATION.adminEmail.test(formData.email)) {
      setError("Admin email must be in format: username.Admin@gmail.com");
      return false;
    }

    if (formData.password.length < VALIDATION.password.minLength) {
      setError(`Password must be at least ${VALIDATION.password.minLength} characters long`);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await apiClient.post("/admin/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Admin created successfully!");
      if (isMounted.current) {
        navigate("/superadmin/dashboard");
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMsg = err.response?.data?.message || "Failed to create admin";
        setError(errorMsg);
        handleApiError(err, {
          fallbackMessage: "Failed to create admin",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-gray-50 pt-28 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/superadmin/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <IconArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <IconShieldCheck size={40} className="text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary-content">
              Create New Admin
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add a new administrator to the system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconUser size={20} />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="Enter admin name"
                  autoComplete="name"
                />
              </div>
            </div>

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
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
                  placeholder="username.Admin@gmail.com"
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: username.Admin@gmail.com
              </p>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-4 py-3 text-primary-content"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
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
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 pr-10 text-primary-content placeholder:text-gray-400"
                  placeholder="Enter password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-content/60 hover:text-primary-content"
                >
                  {showPassword ? (
                    <IconEyeOff size={20} />
                  ) : (
                    <IconEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconLock size={20} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none px-10 py-3 pr-10 text-primary-content placeholder:text-gray-400"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-content/60 hover:text-primary-content"
                >
                  {showConfirmPassword ? (
                    <IconEyeOff size={20} />
                  ) : (
                    <IconEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/superadmin/dashboard")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg py-3 px-4 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
