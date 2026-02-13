import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
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
  IconX,
} from "@tabler/icons-react";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const MotionDiv = motion.div;
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("admins");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalAdmins: 0,
  });
  const [productForm, setProductForm] = useState({
    chemicalname: "",
    description: "",
    category: "Other",
    sku: "",
    hsnCode: "",
    price: "",
    unit: "kg",
    manufacturer: "",
    specifications: "",
    image: "",
  });
  const [productLoading, setProductLoading] = useState(false);
  const [allAdmins, setAllAdmins] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Search and filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      const [adminsRes, statsRes, ordersRes, usersRes] = await Promise.all([
        axiosInstance.get("/admin"),
        axiosInstance.get("/admin/stats"),
        axiosInstance
          .get("/order/view/all")
          .catch(() => ({ data: { data: [] } })),
        axiosInstance
          .get("/admin/users")
          .catch(() => ({ data: { data: { users: [] } } })),
      ]);

      const admins = adminsRes.data?.data?.admins || [];
      const statsData = statsRes.data?.data?.stats;
      const ordersData = ordersRes.data?.data || [];
      const usersData = usersRes.data?.data?.users || [];

      setAllAdmins(admins);
      setOrders(ordersData);
      setUsers(usersData);

      setStats({
        totalUsers: statsData?.totalUsers ?? usersData.length,
        totalProducts: statsData?.totalProducts ?? 0,
        totalOrders: statsData?.totalOrders ?? ordersData.length,
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

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      await axiosInstance.delete(`/admin/${adminId}`);
      toast.success("Admin deleted successfully");
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
      console.error(error);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/${adminId}`, {
        isActive: !currentStatus,
      });
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

    if (!productForm.chemicalname.trim()) {
      toast.error("Chemical name is required");
      return;
    }

    if (productForm.price === "" || Number.isNaN(Number(productForm.price))) {
      toast.error("Valid price is required");
      return;
    }

    try {
      setProductLoading(true);
      await axiosInstance.post("/products", {
        chemicalname: productForm.chemicalname,
        description: productForm.description,
        category: productForm.category,
        sku: productForm.sku,
        hsnCode: productForm.hsnCode,
        price: Number(productForm.price),
        unit: productForm.unit,
        quantity: Number(productForm.quantity) || 0,
        minOrderQuantity: Number(productForm.minOrderQuantity) || 1,
        manufacturer: productForm.manufacturer,
        specifications: productForm.specifications,
        image: productForm.image,
      });

      toast.success("Product created successfully");
      setProductForm({
        chemicalname: "",
        description: "",
        category: "Other",
        sku: "",
        hsnCode: "",
        price: "",
        unit: "kg",
        manufacturer: "",
        specifications: "",
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

  // Order Management Handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/order/${orderId}`, {
        status: newStatus,
      });
      toast.success("Order status updated successfully");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await axiosInstance.delete(`/order/${orderId}`);
      toast.success("Order deleted successfully");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order");
    }
  };

  // User Management Handlers
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      loadDashboardData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
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
        {/* If this were a non-superadmin view the banner would show; superadmins see full list */}
        {admin && !(admin.role === "superadmin" || admin.isSuperAdmin) && (
          <div className="mb-4 max-w-7xl mx-auto px-4">
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
              Admin list is visible to superadmins only. Your view is limited.
            </div>
          </div>
        )}
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

        {/* Tabs Navigation */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg mb-6 p-2"
        >
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("admins")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "admins"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconShield size={20} className="inline mr-2" />
              Admins
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "orders"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconShoppingCart size={20} className="inline mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconUsers size={20} className="inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "products"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconPackage size={20} className="inline mr-2" />
              Add Product
            </button>
          </div>
        </MotionDiv>

        {/* Add Product Tab */}
        {activeTab === "products" && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                  Chemical Name *
                </label>
                <input
                  type="text"
                  value={productForm.chemicalname}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      chemicalname: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Product chemical name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="Cement">Cement</option>
                  <option value="Adhesive">Adhesive</option>
                  <option value="Waterproofing">Waterproofing</option>
                  <option value="Coating">Coating</option>
                  <option value="Sealant">Sealant</option>
                  <option value="Primer">Primer</option>
                  <option value="Concrete Admixture">Concrete Admixture</option>
                  <option value="Repair Material">Repair Material</option>
                  <option value="Grout">Grout</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
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
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={productForm.unit}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="bag">bag</option>
                  <option value="piece">piece</option>
                  <option value="box">box</option>
                  <option value="sqm">sqm</option>
                  <option value="meter">meter</option>
                </select>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={productForm.hsnCode}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      hsnCode: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="38249099"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer/Brand
                </label>
                <input
                  type="text"
                  value={productForm.manufacturer}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      manufacturer: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Brand name"
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
                  rows="2"
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications
                </label>
                <textarea
                  rows="2"
                  value={productForm.specifications}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      specifications: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Technical specifications"
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
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary-content">
                Order Management
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((order) => {
                      const matchesSearch =
                        orderSearch === "" ||
                        order.title
                          ?.toLowerCase()
                          .includes(orderSearch.toLowerCase()) ||
                        order.userId?.name
                          ?.toLowerCase()
                          .includes(orderSearch.toLowerCase()) ||
                        order._id?.includes(orderSearch);
                      const matchesStatus =
                        statusFilter === "all" || order.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 font-mono">
                          #{order._id?.slice(-8)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {order.userId?.name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <div className="max-w-xs truncate">{order.title}</div>
                          <div className="text-xs text-gray-500">
                            Qty: {order.quantity}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                          {order.totalAmount > 0
                            ? `₹${order.totalAmount.toLocaleString("en-IN")}`
                            : "N/A"}
                        </td>
                        <td
                          className="py-3 px-4 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={order.status || "pending"}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(
                                order._id,
                                e.target.value,
                              );
                            }}
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td
                          className="py-3 px-4 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrder(order._id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <IconTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {orders.filter((order) => {
                const matchesSearch =
                  orderSearch === "" ||
                  order.title
                    ?.toLowerCase()
                    .includes(orderSearch.toLowerCase()) ||
                  order.userId?.name
                    ?.toLowerCase()
                    .includes(orderSearch.toLowerCase()) ||
                  order._id?.includes(orderSearch);
                const matchesStatus =
                  statusFilter === "all" || order.status === statusFilter;
                return matchesSearch && matchesStatus;
              }).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <IconShoppingCart
                    size={48}
                    className="mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-lg">No orders found</p>
                </div>
              )}
            </div>
          </MotionDiv>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-primary-content mb-6">
              User Management
            </h2>
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
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                        {user.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <IconTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <IconUsers size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-lg">No users found</p>
                </div>
              )}
            </div>
          </MotionDiv>
        )}

        {/* Admins Management Tab */}
        {activeTab === "admins" && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                            handleToggleStatus(
                              adminUser._id,
                              adminUser.isActive,
                            )
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
                              navigate(
                                `/superadmin/edit-admin/${adminUser._id}`,
                              )
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
                  <IconShield
                    size={48}
                    className="mx-auto mb-3 text-gray-300"
                  />
                  <p className="text-lg">No admin users found</p>
                  <p className="text-sm mt-1">
                    Create your first admin to get started
                  </p>
                </div>
              )}
            </div>
          </MotionDiv>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetails(false)}
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IconX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <p className="font-mono font-semibold">
                      #{selectedOrder._id?.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedOrder.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : selectedOrder.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedOrder.status || "pending"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-semibold text-lg text-purple-600">
                      {selectedOrder.totalAmount > 0
                        ? `₹${selectedOrder.totalAmount.toLocaleString("en-IN")}`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-lg mb-3">
                    Customer Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">
                      {selectedOrder.userId?.name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.userId?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-lg mb-3">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedOrder.title}</p>
                        {selectedOrder.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedOrder.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-semibold">
                          {selectedOrder.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-lg mb-3">
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedOrder.address}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t pt-4 flex gap-3">
                  <select
                    value={selectedOrder.status || "pending"}
                    onChange={(e) => {
                      handleUpdateOrderStatus(
                        selectedOrder._id,
                        e.target.value,
                      );
                      setShowOrderDetails(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => {
                      handleDeleteOrder(selectedOrder._id);
                      setShowOrderDetails(false);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <IconTrash size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </MotionDiv>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
