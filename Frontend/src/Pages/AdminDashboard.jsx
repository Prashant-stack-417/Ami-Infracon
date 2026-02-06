import React, { useEffect, useState, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
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
} from "@tabler/icons-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalAdmins: 0,
  });
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully");
    navigate("/login");
  }, [navigate]);

  const checkAuth = useCallback(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (!storedAdmin || !token) {
      navigate("/login");
      return;
    }

    try {
      const adminData = JSON.parse(storedAdmin);

      // Redirect super admins to their dashboard
      if (adminData.role === "superadmin" || adminData.isSuperAdmin) {
        navigate("/superadmin/dashboard");
        return;
      }

      setAdmin(adminData);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      // Get all admins
      const adminsRes = await axios.get("http://localhost:3802/api/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const admins = adminsRes.data.data.admins || [];
      setAllAdmins(admins);

      // Mock stats - you can replace with real API calls
      setStats({
        totalUsers: 0, // Add API endpoint for users count
        totalProducts: 0, // Add API endpoint for products count
        totalOrders: 0, // Add API endpoint for orders count
        totalAdmins: admins.length,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
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
      toast.error("Failed to delete admin");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center">
        <div className="text-xl font-semibold text-primary-content">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary-content mb-2">
                Admin Dashboard
              </h1>
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
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
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
          </motion.div>
        </div>

        {/* Admins Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-content">
              Admin Users
            </h2>
            {admin?.role === "superadmin" && (
              <button
                onClick={() => navigate("/superadmin/create-admin")}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors"
              >
                <IconUserPlus size={20} />
                <span>Add Admin</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allAdmins.map((adminUser) => (
                  <tr
                    key={adminUser._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {adminUser.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {adminUser.email}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          adminUser.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {adminUser.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          adminUser.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {adminUser.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(adminUser._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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
              <div className="text-center py-8 text-gray-500">
                No admin users found
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
