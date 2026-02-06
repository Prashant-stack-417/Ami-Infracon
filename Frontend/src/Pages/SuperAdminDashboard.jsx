import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconLogout,
  IconHome,
  IconUserPlus,
  IconTrash,
  IconEdit,
  IconShield,
  IconCrown,
} from "@tabler/icons-react";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const MotionDiv = motion.div;
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalAdmins: 0,
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    currency: "INR",
    sku: "",
    image: "",
  });
  const [productLoading, setProductLoading] = useState(false);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (!storedAdmin || !token) {
      navigate("/login");
      return;
    }

    try {
      const adminData = JSON.parse(storedAdmin);
      if (adminData.role !== "superadmin" && !adminData.isSuperAdmin) {
        toast.error("Super admin access required");
        navigate("/admin/dashboard");
        return;
      }
      setAdmin(adminData);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("admin-auth-change"));
    toast.success("Logged out successfully");
    navigate("/login");
  }, [navigate]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      const [adminsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:3802/api/admin", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3802/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const admins = adminsRes.data?.data?.admins || [];
      const statsData = statsRes.data?.data?.stats;
      setAllAdmins(admins);

      setStats({
        totalUsers: statsData?.totalUsers ?? 0,
        totalProducts: statsData?.totalProducts ?? 0,
        totalOrders: statsData?.totalOrders ?? 0,
        totalAdmins: statsData?.totalAdmins ?? admins.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired or unauthorized. Please login again.");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, [checkAuth, loadDashboardData]);

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:3802/api/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Admin deleted successfully");
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
      console.error(error);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `http://localhost:3802/api/admin/${adminId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Admin status updated successfully");
      loadDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update admin status",
      );
      console.error(error);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (productForm.price === "" || Number.isNaN(Number(productForm.price))) {
      toast.error("Valid price is required");
      return;
    }

    try {
      setProductLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.post(
        "http://localhost:3802/api/products",
        {
          ...productForm,
          price: Number(productForm.price),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Product created successfully");
      setProductForm({
        name: "",
        description: "",
        price: "",
        currency: "INR",
        sku: "",
        image: "",
      });
      loadDashboardData();
    } catch (error) {
      console.error("Create product error:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setProductLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-primary-content">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 pt-28 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <IconCrown size={40} className="text-purple-600" />
                <h1 className="text-4xl font-bold text-primary-content">
                  Super Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600">Welcome back, {admin?.name}!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                <IconHome size={20} />
                <span>Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <IconLogout size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </MotionDiv>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <IconUsers size={32} className="text-blue-600" />
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IconPackage size={32} className="text-green-600" />
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <IconShoppingCart size={32} className="text-purple-600" />
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Admins</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalAdmins}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <IconShield size={32} className="text-orange-600" />
              </div>
            </div>
          </MotionDiv>
        </div>

        {/* Add Product */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-primary-content mb-6">
            Add Product
          </h2>
          <form
            onSubmit={handleCreateProduct}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <input
                type="text"
                value={productForm.currency}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="INR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    sku: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="SKU-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={productForm.image}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    image: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="3"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Product description"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={productLoading}
                className="px-5 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary-dark transition disabled:opacity-60"
              >
                {productLoading ? "Saving..." : "Create Product"}
              </button>
            </div>
          </form>
        </MotionDiv>

        {/* Admins Management Table */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-content flex items-center gap-2">
              <IconShield size={28} className="text-purple-600" />
              Admin Management
            </h2>
            <button
              onClick={() => navigate("/superadmin/create-admin")}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <IconUserPlus size={20} />
              <span>Create New Admin</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allAdmins.map((adminUser) => (
                  <tr
                    key={adminUser._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                      {adminUser.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {adminUser.email}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          adminUser.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {adminUser.role === "superadmin"
                          ? "Super Admin"
                          : "Admin"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() =>
                          handleToggleStatus(adminUser._id, adminUser.isActive)
                        }
                        disabled={adminUser._id === admin?._id}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          adminUser.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } ${adminUser._id === admin?._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {adminUser.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(adminUser.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/superadmin/edit-admin/${adminUser._id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Admin"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(adminUser._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Admin"
                          disabled={adminUser._id === admin?._id}
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {allAdmins.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <IconShield size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No admin users found</p>
                <p className="text-sm mt-1">
                  Create your first admin to get started
                </p>
              </div>
            )}
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
