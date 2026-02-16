import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import { VALIDATION } from "../config/constants";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconMail,
  IconUser,
  IconShield,
} from "@tabler/icons-react";

const EditAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMounted = useIsMounted();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAdmin = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin");

      const data = res.data;
      const admins = data.data?.admins || [];
      const target = admins.find((a) => a._id === id);

      if (!target) {
        toast.error("Admin not found");
        navigate("/superadmin/dashboard");
        return;
      }

      if (isMounted.current) {
        setFormData({
          name: target.name || "",
          email: target.email || "",
          role: target.role || "admin",
          isActive: target.isActive ?? true,
        });
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to load admin details",
      });
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, navigate, isMounted]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const validate = () => {
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return false;
    }
    if (!VALIDATION.adminEmail.test(formData.email)) {
      setError("Admin email must be in format: username.Admin@gmail.com");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await axiosInstance.put(`/admin/${id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
      });

      toast.success("Admin updated successfully");
      if (isMounted.current) {
        navigate("/superadmin/dashboard");
      }
    } catch (err) {
      if (isMounted.current) {
        handleApiError(err, {
          fallbackMessage: "Failed to update admin",
        });
      }
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-primary-content">
          Loading...
        </div>
      </div>
    );
  }

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
              Edit Admin
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Update admin details and status
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-primary-content mb-1"
              >
                Role
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
                  <IconShield size={20} />
                </span>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-primary-content/20 focus:border-primary focus:ring-2 focus:ring-primary/40 outline-none pl-10 pr-4 py-3 text-primary-content"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-primary-content"
              >
                Active
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAdmin;
