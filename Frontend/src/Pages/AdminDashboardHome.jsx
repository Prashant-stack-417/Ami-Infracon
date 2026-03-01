import { useEffect, useState, useCallback } from "react";
import anime from "animejs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import {
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconArrowRight,
  IconTrendingUp,
  IconClock,
} from "@tabler/icons-react";

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("admin-auth-change"));
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
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      // Fetch orders, users, and products in parallel
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        axiosInstance
          .get("/order/view/all")
          .catch(() => ({ data: { data: [] } })),

        axiosInstance
          .get("/admin/users")
          .catch(() => ({ data: { data: { users: [] } } })),

        axiosInstance
          .get("/products")
          .catch(() => ({ data: { data: { products: [] } } })),
      ]);

      if (!isMounted.current) return;

      const ordersData = ordersRes.data?.data || [];
      const usersData = usersRes.data?.data?.users || [];
      const productsData = productsRes.data?.data?.products || [];

      // Get recent orders (last 5)
      const sortedOrders = [...ordersData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentOrders(sortedOrders.slice(0, 5));

      setStats({
        totalUsers: usersData.length,
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter((o) => o.status === "pending").length,
        completedOrders: ordersData.filter((o) => o.status === "completed")
          .length,
      });
    } catch (error) {
      if (!isMounted.current) return;
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else {
        handleApiError(error, {
          fallbackMessage: "Failed to load dashboard data",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [handleLogout, isMounted]);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, [checkAuth, loadDashboardData]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".admin-home-header",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".admin-home-stat",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".admin-home-quick",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100, { start: 200 }),
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".admin-home-recent",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 500,
        duration: 500,
        easing: "easeOutCubic"
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center">
        <div className="text-xl font-semibold text-primary-content">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 admin-home-header opacity-0">
          <div>
            <h1 className="text-4xl font-bold text-primary-content mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {admin?.name}!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer admin-home-stat opacity-0"
            onClick={() => navigate("/admin/users")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-primary-content mb-1">
                  {stats.totalUsers}
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <IconTrendingUp size={14} />
                  <span>View all users</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <IconUsers size={32} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer admin-home-stat opacity-0"
            onClick={() => navigate("/admin/products")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Products</p>
                <p className="text-3xl font-bold text-primary-content mb-1">
                  {stats.totalProducts}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <IconTrendingUp size={14} />
                  <span>Manage products</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IconPackage size={32} className="text-green-600" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer admin-home-stat opacity-0"
            onClick={() => navigate("/admin/orders")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-primary-content mb-1">
                  {stats.totalOrders}
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <IconTrendingUp size={14} />
                  <span>View all orders</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <IconShoppingCart size={32} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 admin-home-quick opacity-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Status
              </h3>
              <IconClock size={24} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {stats.pendingOrders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Orders</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {stats.completedOrders}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 admin-home-quick opacity-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/admin/orders")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-primary to-primary-focus text-white rounded-lg hover:shadow-md transition-all"
              >
                <span className="font-medium">Manage Orders</span>
                <IconArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate("/admin/products")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md transition-all"
              >
                <span className="font-medium">Manage Products</span>
                <IconArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6 admin-home-recent opacity-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-content">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 text-primary hover:text-primary-focus transition-colors"
            >
              <span className="text-sm font-medium">View All</span>
              <IconArrowRight size={18} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 font-mono">
                      #{order._id?.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {order.userId?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <div className="max-w-xs truncate">{order.title}</div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                      {order.totalAmount > 0
                        ? `₹${order.totalAmount.toLocaleString("en-IN")}`
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent orders
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
