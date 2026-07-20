import { useEffect, useState, useCallback, useMemo } from "react";
import anime from "animejs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import {
  IconShoppingCart,
  IconTrash,
  IconX,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import { SkeletonTableRow, SkeletonText } from "../Components/SkeletonLoader";

const OrderManagement = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const checkAuth = useCallback(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (!storedAdmin || !token) {
      navigate("/login");
      return false;
    }
    return true;
  }, [navigate]);

  const loadOrders = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const ordersRes = await axiosInstance
        .get("/order/view/all")
        .catch(() => ({ data: { data: [] } }));

      if (!isMounted.current) return;

      const ordersData = ordersRes.data?.data || [];
      setOrders(ordersData);
    } catch (error) {
      if (!isMounted.current) return;
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        handleApiError(error, {
          fallbackMessage: "Failed to load orders",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isMounted, navigate]);

  useEffect(() => {
    if (checkAuth()) {
      loadOrders();
    }
  }, [checkAuth, loadOrders]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      orderSearch === "" ||
      order.title?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order._id?.includes(orderSearch);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [orders, orderSearch, statusFilter]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".order-mgt-main",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".order-mgt-stat",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutCubic"
      });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && filteredOrders.length > 0) {
      anime({
        targets: ".order-mgt-row",
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: anime.stagger(40),
        duration: 320,
        easing: "easeOutCubic"
      });
    }
  }, [loading, filteredOrders]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/order/${orderId}`, {
        status: newStatus,
      });
      toast.success("Order status updated successfully");
      if (isMounted.current) {
        loadOrders();
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
        loadOrders();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete order",
      });
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <SkeletonText className="h-10 w-1/4 mb-2" />
              <SkeletonText className="h-4 w-1/3 mb-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <th key={i} className="text-left py-3 px-4">
                        <SkeletonText className="h-4 w-20 mb-0" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonTableRow key={i} columns={7} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 order-mgt-main opacity-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-content mb-1">
                Order Management
              </h1>
              <p className="text-gray-600">
                Manage and track all customer orders
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-50">
                <IconSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="relative">
                <IconFilter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 order-mgt-stat opacity-0">
              <p className="text-sm text-blue-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
            </div>
            <div className="bg-linear-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 order-mgt-stat opacity-0">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 order-mgt-stat opacity-0">
              <p className="text-sm text-purple-600 font-medium">Processing</p>
              <p className="text-2xl font-bold text-purple-900">
                {orders.filter((o) => o.status === "processing").length}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 order-mgt-stat opacity-0">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter((o) => o.status === "completed").length}
              </p>
            </div>
          </div>

          {/* Orders Table */}
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
                    Item
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Total Amount
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer order-mgt-row"
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
                          handleUpdateOrderStatus(order._id, e.target.value);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${order.status === "completed"
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
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <IconShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setShowOrderDetails(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-200"
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
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${selectedOrder.status === "completed"
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
                    <p className="font-semibold text-lg text-primary">
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
                        <p className="font-semibold">{selectedOrder.quantity}</p>
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
                      handleUpdateOrderStatus(selectedOrder._id, e.target.value);
                      setShowOrderDetails(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
