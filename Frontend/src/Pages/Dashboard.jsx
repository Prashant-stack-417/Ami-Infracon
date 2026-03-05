import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../app/userStore";
import toast from "react-hot-toast";
import anime from "animejs";
import {
  IconPackage,
  IconClock,
  IconCheck,
  IconX,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import useAnimeScroll from "../hooks/useAnimeScroll";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const getOrders = useUserStore((s) => s.getOrders);
  const deleteOrder = useUserStore((s) => s.deleteOrder);
  const isMounted = useIsMounted();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.address?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, sortOrder]);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      setError("Failed to load your orders. Please try again.");
      handleApiError(error, {
        fallbackMessage: "Failed to load your orders",
      });
    } finally {
      setLoading(false);
    }
  }, [getOrders, user, navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    anime({
      targets: ".dashboard-main",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: "easeOutCubic"
    });
  }, []);

  // Re-run entrance animation whenever the visible order list changes
  // (e.g. after search / filter / sort updates or fresh data load).
  useEffect(() => {
    if (!loading && filteredAndSortedOrders.length > 0) {
      anime({
        targets: ".dashboard-order-item",
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        delay: anime.stagger(50),
        easing: "easeOutCubic"
      });
    }
  }, [loading, filteredAndSortedOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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

  const stats = useMemo(
    () => ({
      total: orders.length,
      processing: orders.filter((o) => o.status === "processing" || o.status === "pending").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders],
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <IconCheck className="text-green-500" size={20} />;
      case "cancelled":
        return <IconX className="text-red-500" size={20} />;
      case "processing":
      case "pending":
        return <IconClock className="text-blue-500" size={20} />;
      default:
        return <IconPackage className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "Processing";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statsRef = useAnimeScroll({ direction: "up", duration: 700, staggerDelay: 120, animateChildren: ".dashboard-stat-card", delay: 200, once: true });
  const ordersRef = useAnimeScroll({ direction: "up", duration: 600, delay: 100 });

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="dashboard-main opacity-0">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-1 bg-primary rounded-full" />
                <span className="type-overline text-primary">My Account</span>
              </div>
              <h1 className="text-3xl font-bold text-primary-content mb-1">
                Welcome back, <span className="text-primary">{user?.name}</span>!
              </h1>
              <p className="text-gray-500">Manage your orders and track deliveries</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="self-start sm:self-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh orders"
            >
              <IconRefresh
                size={20}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="stat-card stat-accent-red p-5 dashboard-stat-card opacity-0">
              <div className="bg-red-50 p-2.5 rounded-xl w-fit mb-3">
                <IconPackage size={24} className="text-primary" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-0.5">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="stat-card stat-accent-blue p-5 dashboard-stat-card opacity-0">
              <div className="bg-blue-50 p-2.5 rounded-xl w-fit mb-3">
                <IconClock size={24} className="text-blue-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-0.5">Processing</p>
              <p className="text-3xl font-bold text-gray-900">{stats.processing}</p>
            </div>

            <div className="stat-card stat-accent-green p-5 dashboard-stat-card opacity-0">
              <div className="bg-green-50 p-2.5 rounded-xl w-fit mb-3">
                <IconCheck size={24} className="text-green-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-0.5">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>

            <div className="stat-card stat-accent-red p-5 dashboard-stat-card opacity-0">
              <div className="bg-red-50 p-2.5 rounded-xl w-fit mb-3">
                <IconX size={24} className="text-red-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-0.5">Cancelled</p>
              <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>

          {/* Orders List */}
          <div ref={ordersRef} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-content">Your Orders</h2>
                <p className="text-sm text-gray-500 mt-0.5">Track and manage your order history</p>
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:min-w-62.5">
                  <IconSearch
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    aria-label="Search orders"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <IconFilter
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Sort Order */}
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  aria-label={`Sort ${sortOrder === "desc" ? "ascending" : "descending"}`}
                >
                  {sortOrder === "desc" ? (
                    <IconSortDescending size={20} />
                  ) : (
                    <IconSortAscending size={20} />
                  )}
                  <span className="hidden sm:inline">Date</span>
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <IconAlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error Loading Orders</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={loadOrders}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your orders...</p>
              </div>
            ) : filteredAndSortedOrders.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <IconPackage size={36} className="text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-xl mb-1">
                  {searchQuery || statusFilter !== "all" ? "No orders found" : "No orders yet"}
                </p>
                <p className="text-sm text-gray-400 mb-5">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Your order history will appear here"}
                </p>
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                    className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              /* Orders Grid */
              <div className="space-y-3">
                {filteredAndSortedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="order-card p-5 dashboard-order-item opacity-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-gray-50">
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-lg text-primary-content truncate">
                                {order.title}
                              </h3>
                              <span
                                className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            {order.description && (
                              <p className="text-gray-500 text-sm line-clamp-2">
                                {order.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 pl-11">
                          {order.quantity && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">Qty:</span> {order.quantity}
                            </span>
                          )}
                          {order.address && (
                            <span className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="font-medium text-gray-700 shrink-0">Delivery:</span>
                              <span className="truncate">{order.address}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="shrink-0 p-2 text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                        aria-label="Delete order"
                        title="Delete order"
                      >
                        <IconX size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Results Summary */}
                <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
                  Showing <span className="font-semibold text-gray-600">{filteredAndSortedOrders.length}</span> of <span className="font-semibold text-gray-600">{orders.length}</span> orders
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
