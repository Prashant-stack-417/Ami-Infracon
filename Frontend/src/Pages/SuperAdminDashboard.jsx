import { useEffect, useState, useCallback } from "react";
import anime from "animejs";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import {
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconTrash,
  IconShield,
  IconCrown,
  IconEye,
  IconArrowRight,
  IconTrendingUp,
} from "@tabler/icons-react";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalAdmins: 0,
  });
  const [allAdmins, setAllAdmins] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
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
    if (!isMounted.current) return;
    setLoading(true);
    try {

      const [adminsRes, statsRes, ordersRes] = await Promise.all([
        axiosInstance.get("/admin"),
        axiosInstance.get("/admin/stats"),
        axiosInstance
          .get("/order/view/all")
          .catch(() => ({ data: { data: [] } })),
      ]);

      if (!isMounted.current) return;

      const admins = adminsRes.data?.data?.admins || [];
      const statsData = statsRes.data?.data?.stats;
      const ordersData = ordersRes.data?.data || [];


      setAllAdmins(admins);
      setRecentOrders(ordersData.slice(0, 5)); // Get only recent 5 orders

      setStats({
        totalUsers: statsData?.totalUsers ?? 0,
        totalProducts: statsData?.totalProducts ?? 0,
        totalOrders: statsData?.totalOrders ?? ordersData.length,
        totalAdmins: statsData?.totalAdmins ?? admins.length,
      });
    } catch (error) {
      if (!isMounted.current) return;
      console.error('❌ Dashboard data error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired or unauthorized. Please login again.");
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

  // Refresh dashboard when admin auth changes (login/logout from other components)
  useEffect(() => {
    const handler = () => {
      // Run auth check first. Only call loadDashboardData if admin token still present.
      checkAuth();
      const token = localStorage.getItem("adminToken");
      const storedAdmin = localStorage.getItem("admin");
      if (token && storedAdmin) {
        loadDashboardData();
      }
    };
    window.addEventListener("admin-auth-change", handler);
    return () => window.removeEventListener("admin-auth-change", handler);
  }, [checkAuth, loadDashboardData]);

  // Poll dashboard data every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      const token = localStorage.getItem("adminToken");
      const storedAdmin = localStorage.getItem("admin");
      if (token && storedAdmin) loadDashboardData();
    }, 30000);
    return () => clearInterval(id);
  }, [loadDashboardData]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".sadmin-header",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".sadmin-stat-card",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".sadmin-quick-action-section",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 200,
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".sadmin-recent-orders",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 300,
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".sadmin-admin-mgt",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 400,
        duration: 500,
        easing: "easeOutCubic"
      });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && recentOrders.length > 0) {
      anime({
        targets: ".sadmin-order-row",
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(50),
        duration: 400,
        easing: "easeOutCubic"
      });
    }
  }, [loading, recentOrders]);

  useEffect(() => {
    if (!loading && allAdmins.length > 0) {
      anime({
        targets: ".sadmin-admin-row",
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(50),
        duration: 400,
        easing: "easeOutCubic"
      });
    }
  }, [loading, allAdmins]);

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      await axiosInstance.delete(`/admin/${adminId}`);
      toast.success("Admin deleted successfully");
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete admin",
      });
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/${adminId}`, {
        isActive: !currentStatus,
      });
      toast.success("Admin status updated successfully");
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to update admin status",
      });
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
        <div className="mb-8 sadmin-header opacity-0">
          <div>
            <h1 className="text-4xl font-bold text-primary-content mb-2 flex items-center gap-3">
              <IconCrown size={36} className="text-purple-600" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {admin?.name}!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 sadmin-stat-card opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Admins</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalAdmins}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <IconShield size={32} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 sadmin-stat-card opacity-0">
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
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 sadmin-stat-card opacity-0">
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
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 sadmin-stat-card opacity-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <IconShoppingCart size={32} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Links to dedicated pages */}
        <div className="mb-8 sadmin-quick-action-section opacity-0">
          <h2 className="text-2xl font-bold text-primary-content mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/orders">
              <div className="bg-linear-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-6 shadow-md border border-orange-200 transition-all cursor-pointer hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <IconShoppingCart size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Manage Orders
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  View and update order status
                </p>
              </div>
            </Link>

            <Link to="/admin/users">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 shadow-md border border-blue-200 transition-all cursor-pointer hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <IconUsers size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Manage Users
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">View and manage customers</p>
              </div>
            </Link>

            <Link to="/admin/products">
              <div className="bg-linear-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 shadow-md border border-green-200 transition-all cursor-pointer hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <IconPackage size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Manage Products
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Update product catalog
                </p>
              </div>
            </Link>

            <Link to="/superadmin/create-admin">
              <div className="bg-linear-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-6 shadow-md border border-purple-200 transition-all cursor-pointer hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <IconShield size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Create Admin
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">Add new admin account</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 sadmin-recent-orders opacity-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-content">
                Recent Orders
              </h2>
              <p className="text-gray-600">Latest customer orders</p>
            </div>
            <Link to="/admin/orders">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all font-medium hover:scale-[1.05] active:scale-[0.95]"
              >
                <span>View All</span>
                <IconArrowRight size={18} />
              </button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <IconShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-100 hover:bg-gray-50 sadmin-order-row opacity-0"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        #{order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {order.userId?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        ₹{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "processing"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link to={`/admin/orders`}>
                          <button
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors hover:scale-110 active:scale-95"
                            title="View Details"
                          >
                            <IconEye size={18} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 sadmin-admin-mgt opacity-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-content">
                Admin Management
              </h2>
              <p className="text-gray-600">Manage admin accounts and permissions</p>
            </div>
            <Link to="/superadmin/create-admin">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium shadow-md hover:scale-[1.05] active:scale-[0.95]"
              >
                <IconShield size={18} />
                <span>Create Admin</span>
              </button>
            </Link>
          </div>

          {allAdmins.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <IconShield size={48} className="mx-auto mb-4 opacity-30" />
              <p>No admins found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {allAdmins.map((adminItem) => (
                <div
                  key={adminItem._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all sadmin-admin-row opacity-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${adminItem.role === "superadmin" || adminItem.isSuperAdmin
                        ? "bg-purple-100"
                        : "bg-blue-100"
                        }`}
                    >
                      {adminItem.role === "superadmin" ||
                        adminItem.isSuperAdmin ? (
                        <IconCrown size={24} className="text-purple-600" />
                      ) : (
                        <IconShield size={24} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {adminItem.name}
                        </h3>
                        {(adminItem.role === "superadmin" ||
                          adminItem.isSuperAdmin) && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              Super Admin
                            </span>
                          )}
                        {!adminItem.isActive && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{adminItem.email}</p>
                      {adminItem.phone && (
                        <p className="text-xs text-gray-500 mt-1">
                          {adminItem.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Don't allow superadmin to delete themselves */}
                  {adminItem._id !== admin?._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(adminItem._id, adminItem.isActive)
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.05] active:scale-[0.95] ${adminItem.isActive
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                      >
                        {adminItem.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {!(
                        adminItem.role === "superadmin" ||
                        adminItem.isSuperAdmin
                      ) && (
                          <button
                            onClick={() => handleDeleteAdmin(adminItem._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-[1.05] active:scale-[0.95]"
                            title="Delete Admin"
                          >
                            <IconTrash size={18} />
                          </button>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
