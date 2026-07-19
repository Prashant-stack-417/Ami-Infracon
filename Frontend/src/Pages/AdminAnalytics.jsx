import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { 
  IconTrendingUp, 
  IconShoppingCart, 
  IconUsers, 
  IconPackage,
  IconRefresh
} from "@tabler/icons-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from "recharts";
import anime from "animejs";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [revenueTimeline, setRevenueTimeline] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, revRes, topRes] = await Promise.all([
        axiosInstance.get("/analytics/dashboard"),
        axiosInstance.get("/analytics/revenue?days=7"),
        axiosInstance.get("/analytics/top-products?limit=5")
      ]);

      if (dashRes.data?.success) setMetrics(dashRes.data.data);
      if (revRes.data?.success) setRevenueTimeline(revRes.data.data);
      if (topRes.data?.success) setTopProducts(topRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".analytic-card",
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: "easeOutExpo"
      });
      anime({
        targets: ".chart-box",
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(150, { start: 200 }),
        duration: 700,
        easing: "easeOutExpo"
      });
    }
  }, [loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Key metrics and performance</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <IconRefresh size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="analytic-card opacity-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <IconTrendingUp size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(metrics.totalRevenue)}</p>
          </div>
          
          <div className="analytic-card opacity-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <IconShoppingCart size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalOrders}</p>
          </div>

          <div className="analytic-card opacity-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <IconUsers size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalUsers}</p>
          </div>

          <div className="analytic-card opacity-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
              <IconPackage size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalProducts}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="chart-box opacity-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Timeline (7 Days)</h3>
            <div className="h-80 w-full">
              {revenueTimeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTimeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => {
                        const d = new Date(tick);
                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                      }}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value / 1000}k`}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No revenue data available</div>
              )}
            </div>
          </div>

          <div className="chart-box opacity-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h3>
            <div className="h-80 w-full">
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="title" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4b5563', fontSize: 13 }}
                      width={120}
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'quantitySold' ? 'Units Sold' : name]}
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="quantitySold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No sales data available</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
