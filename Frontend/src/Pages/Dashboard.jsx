import { useEffect, useState, useCallback } from "react";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { IconPackage, IconClock, IconCheck, IconX } from "@tabler/icons-react";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";

const Dashboard = () => {
  const user = useUserStore((s) => s.user);
  const getOrders = useUserStore((s) => s.getOrders);
  const deleteOrder = useUserStore((s) => s.deleteOrder);
  const isMounted = useIsMounted();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      if (isMounted.current) {
        setOrders(data || []);
      }
    } catch (error) {
      if (isMounted.current) {
        handleApiError(error, {
          fallbackMessage: "Failed to load your orders",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [getOrders, isMounted]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleDelete = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await deleteOrder(orderId);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <IconCheck className="text-green-500" size={20} />;
      case "cancelled":
        return <IconX className="text-red-500" size={20} />;
      case "processing":
        return <IconClock className="text-blue-500" size={20} />;
      default:
        return <IconPackage className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary-content mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">Manage your donations and orders</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-primary-content">
                    {orders.length}
                  </p>
                </div>
                <IconPackage size={40} className="text-primary" />
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
                  <p className="text-gray-600 text-sm">Processing</p>
                  <p className="text-3xl font-bold text-primary-content">
                    {orders.filter((o) => o.status === "processing").length}
                  </p>
                </div>
                <IconClock size={40} className="text-blue-500" />
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
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-primary-content">
                    {orders.filter((o) => o.status === "completed").length}
                  </p>
                </div>
                <IconCheck size={40} className="text-green-500" />
              </div>
            </motion.div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary-content mb-6">
              Your Orders
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <IconPackage size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No orders yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start by creating your first donation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(order.status)}
                          <h3 className="font-semibold text-lg text-primary-content">
                            {order.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status === "pending"
                              ? "Processing"
                              : order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {order.description || "No description"}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Quantity: {order.quantity}</span>
                          <span>•</span>
                          <span>{order.address}</span>
                          <span>•</span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <IconX size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
