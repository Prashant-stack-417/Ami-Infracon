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
  IconArticle,
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
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <span className="type-overline text-primary">Admin Panel</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-primary-content mb-1">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">Welcome back, <span className="font-semibold text-gray-700">{admin?.name}</span>! Here's what's happening today.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            className="stat-card stat-accent-blue p-6 cursor-pointer admin-home-stat opacity-0"
            onClick={() => navigate("/admin/users")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <IconUsers size={28} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <IconTrendingUp size={12} />
                <span>View All</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Users</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div
            className="stat-card stat-accent-green p-6 cursor-pointer admin-home-stat opacity-0"
            onClick={() => navigate("/admin/products")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <IconPackage size={28} className="text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <IconTrendingUp size={12} />
                <span>Manage</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>

          <div
            className="stat-card stat-accent-purple p-6 cursor-pointer admin-home-stat opacity-0"
            onClick={() => navigate("/admin/orders")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <IconShoppingCart size={28} className="text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                <IconTrendingUp size={12} />
                <span>View All</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 admin-home-quick opacity-0">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Order Status Breakdown</h3>
              <IconClock size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  <span className="text-sm text-gray-600">Pending Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: stats.totalOrders ? `${Math.round((stats.pendingOrders / stats.totalOrders) * 100)}%` : "0%" }}
                    />
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold min-w-8 text-center">
                    {stats.pendingOrders}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">Completed Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: stats.totalOrders ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%` : "0%" }}
                    />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold min-w-8 text-center">
                    {stats.completedOrders}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 admin-home-quick opacity-0">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/analytics")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <IconTrendingUp size={18} />
                  <span className="font-semibold text-sm">View Analytics</span>
                </div>
                <IconArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/admin/orders")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <IconShoppingCart size={18} />
                  <span className="font-semibold text-sm">Manage Orders</span>
                </div>
                <IconArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/admin/products")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <IconPackage size={18} />
                  <span className="font-semibold text-sm">Manage Products</span>
                </div>
                <IconArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <IconUsers size={18} />
                  <span className="font-semibold text-sm">Manage Users</span>
                </div>
                <IconArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/admin/blogs")}
                className="w-full flex items-center justify-between px-4 py-3 bg-linear-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <IconArticle size={18} />
                  <span className="font-semibold text-sm">Manage Blogs</span>
                </div>
                <IconArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 admin-home-recent opacity-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-primary-content">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-0.5">Latest 5 customer orders</p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all font-semibold text-sm"
            >
              <span>View All</span>
              <IconArrowRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <td className="py-3.5 px-4 text-sm font-mono text-gray-600 font-medium">
                      #{order._id?.slice(-8)}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-700 font-medium">
                      {order.userId?.name || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600">
                      <div className="max-w-xs truncate">{order.title}</div>
                    </td>
                    <td className="py-3.5 px-4 text-sm font-bold text-gray-800">
                      {order.totalAmount > 0
                        ? `₹${order.totalAmount.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div className="text-center py-12">
                <IconShoppingCart size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
