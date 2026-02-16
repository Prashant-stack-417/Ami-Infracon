import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { resolveImage } from "../utils/imageUtils";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
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
  IconPlus,
} from "@tabler/icons-react";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();

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
    quantity: "",
    minOrderQuantity: "",
    manufacturer: "",
    specifications: "",
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [products, setProducts] = useState([]);
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
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const [adminsRes, statsRes, ordersRes, usersRes, productsRes] =
        await Promise.all([
          axiosInstance.get("/admin"),
          axiosInstance.get("/admin/stats"),
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

      const admins = adminsRes.data?.data?.admins || [];
      const statsData = statsRes.data?.data?.stats;
      const ordersData = ordersRes.data?.data || [];
      const usersData = usersRes.data?.data?.users || [];
      const productsData = productsRes.data?.data?.products || [];

      setAllAdmins(admins);
      setOrders(ordersData);
      setUsers(usersData);
      setProducts(productsData);

      setStats({
        totalUsers: statsData?.totalUsers ?? usersData.length,
        totalProducts: statsData?.totalProducts ?? productsData.length,
        totalOrders: statsData?.totalOrders ?? ordersData.length,
        totalAdmins: statsData?.totalAdmins ?? admins.length,
      });
    } catch (error) {
      if (!isMounted.current) return;
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

      // Upload image first if present
      let imageUrl = "";
      if (productForm.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", productForm.image);
        const uploadRes = await axiosInstance.post(
          "/products/upload",
          imageFormData,
        );
        imageUrl = uploadRes.data?.data?.url || "";
      }

      const productData = {
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
        image: imageUrl || editingProduct?.image || "",
      };

      if (editingProduct) {
        await axiosInstance.put(`/products/${editingProduct._id}`, productData);
        toast.success("Product updated successfully");
      } else {
        await axiosInstance.post("/products", productData);
        toast.success("Product created successfully");
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        chemicalname: "",
        description: "",
        category: "Other",
        sku: "",
        hsnCode: "",
        price: "",
        unit: "kg",
        quantity: "",
        minOrderQuantity: "",
        manufacturer: "",
        specifications: "",
        image: null,
      });
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to save product",
      });
    } finally {
      setProductLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      chemicalname: product.chemicalname || "",
      description: product.description || "",
      category: product.category || "Other",
      sku: product.sku || "",
      hsnCode: product.hsnCode || "",
      price: product.price || "",
      unit: product.unit || "kg",
      quantity: product.quantity || "",
      minOrderQuantity: product.minOrderQuantity || "",
      manufacturer: product.manufacturer || "",
      specifications: product.specifications || "",
      image: null,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axiosInstance.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete product",
      });
    }
  };

  // Order Management Handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/order/${orderId}`, {
        status: newStatus,
      });
      toast.success("Order status updated successfully");
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to update order status",
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await axiosInstance.delete(`/order/${orderId}`);
      toast.success("Order deleted successfully");
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete order",
      });
    }
  };

  // User Management Handlers
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      if (isMounted.current) {
        loadDashboardData();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete user",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary-content mb-2 flex items-center gap-3">
                <IconCrown size={36} className="text-purple-600" />
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {admin?.name}!</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                <IconHome size={20} />
                <span>Home</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <IconLogout size={20} />
                <span>Logout</span>
              </motion.button>
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
                <p className="text-gray-600 text-sm">Total Admins</p>
                <p className="text-3xl font-bold text-primary-content">
                  {stats.totalAdmins}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <IconShield size={32} className="text-purple-600" />
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
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
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
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg mb-6 p-2"
        >
          <div className="flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("admins")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "admins"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconShield size={20} className="inline mr-2" />
              Admins
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("orders")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "orders"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconShoppingCart size={20} className="inline mr-2" />
              Orders
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("users")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconUsers size={20} className="inline mr-2" />
              Users
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("products")}
              className={`flex-1 min-w-35 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "products"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconPackage size={20} className="inline mr-2" />
              Products
            </motion.button>
          </div>
        </motion.div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-primary-content">
                  Product Management
                </h2>
                <p className="text-gray-600">
                  Manage your product catalog and inventory
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    chemicalname: "",
                    description: "",
                    category: "Other",
                    sku: "",
                    hsnCode: "",
                    price: "",
                    unit: "kg",
                    quantity: "",
                    minOrderQuantity: "",
                    manufacturer: "",
                    specifications: "",
                    image: null,
                  });
                  setShowProductForm(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <IconPlus size={20} />
                <span>Add Product</span>
              </motion.button>
            </div>

            {/* Product Count */}
            {products.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Total{" "}
                  <span className="font-semibold text-gray-900">
                    {products.length}
                  </span>{" "}
                  {products.length === 1 ? "product" : "products"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Image Section */}
                  <div className="relative overflow-hidden bg-gray-50 aspect-square">
                    <img
                      src={resolveImage(product.image)}
                      alt={product.chemicalname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Badge */}
                    {product.category && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-linear-to-r from-red-600 to-red-500 rounded-full shadow-md">
                          {product.category}
                        </span>
                      </div>
                    )}
                    {/* SKU Badge */}
                    {product.sku && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm rounded-md shadow">
                          {product.sku}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-14">
                      {product.chemicalname}
                    </h3>

                    {/* Brand */}
                    {product.manufacturer && (
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 font-medium truncate">
                          {product.manufacturer}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-10">
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100">
                      <span className="text-2xl font-bold text-red-600">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        /{product.unit}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        <IconEdit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        <IconTrash size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Loading State */}
            {loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 mb-4 text-red-600 animate-pulse">
                  <IconPackage size={80} stroke={1.5} />
                </div>
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 mb-4 text-gray-300">
                  <IconPackage size={80} stroke={1.5} />
                </div>
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm mb-4">
                  Get started by adding your first product
                </p>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      chemicalname: "",
                      description: "",
                      category: "Other",
                      sku: "",
                      hsnCode: "",
                      price: "",
                      unit: "kg",
                      quantity: "",
                      minOrderQuantity: "",
                      manufacturer: "",
                      specifications: "",
                      image: null,
                    });
                    setShowProductForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
                >
                  <IconPlus size={20} />
                  <span>Add Your First Product</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Product Form Modal */}
        <AnimatePresence>
          {showProductForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-bold text-primary-content mb-4">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  {/* Chemical Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chemical Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.chemicalname}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          chemicalname: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Category and SKU */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="Cement">Cement</option>
                        <option value="Adhesive">Adhesive</option>
                        <option value="Waterproofing">Waterproofing</option>
                        <option value="Coating">Coating</option>
                        <option value="Sealant">Sealant</option>
                        <option value="Primer">Primer</option>
                        <option value="Concrete Admixture">
                          Concrete Admixture
                        </option>
                        <option value="Repair Material">Repair Material</option>
                        <option value="Grout">Grout</option>
                        <option value="Other">Other</option>
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
                          setProductForm({
                            ...productForm,
                            sku: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Product code"
                      />
                    </div>
                  </div>

                  {/* HSN Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      value={productForm.hsnCode}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          hsnCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 38249099"
                    />
                  </div>

                  {/* Price and Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                          setProductForm({
                            ...productForm,
                            unit: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  </div>

                  {/* Quantity and Min Order Quantity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.quantity}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            quantity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Stock"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={productForm.minOrderQuantity}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            minOrderQuantity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Min qty"
                      />
                    </div>
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer/Brand
                    </label>
                    <input
                      type="text"
                      value={productForm.manufacturer}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          manufacturer: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Specifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specifications
                    </label>
                    <textarea
                      value={productForm.specifications}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          specifications: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Technical specs"
                    />
                  </div>

                  {/* Product Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.files[0],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={productLoading}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-60"
                    >
                      {productLoading ? "Creating..." : "Create Product"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setProductForm({
                          chemicalname: "",
                          description: "",
                          category: "Other",
                          sku: "",
                          hsnCode: "",
                          price: "",
                          unit: "kg",
                          quantity: "",
                          minOrderQuantity: "",
                          manufacturer: "",
                          specifications: "",
                          image: null,
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
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
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
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
          </motion.div>
        )}

        {/* Admins Management Tab */}
        {activeTab === "admins" && (
          <motion.div
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
          </motion.div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
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
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
