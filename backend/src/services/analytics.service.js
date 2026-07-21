import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";

class AnalyticsService {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics() {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();

    // Total Revenue (Only completed or processing orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ["completed", "processing", "pending"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return { totalOrders, totalUsers, totalProducts, totalRevenue };
  }

  /**
   * Get revenue timeline for N days
   */
  async getRevenueTimeline(days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeline = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["completed", "processing", "pending"] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Backfill empty days
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const existing = timeline.find(t => t._id === dateStr);
      result.push({
        date: dateStr,
        revenue: existing ? existing.revenue : 0,
        orders: existing ? existing.orders : 0
      });
    }

    return result;
  }

  /**
   * Get top selling products
   */
  async getTopProducts(limit) {
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ["completed", "processing", "pending"] } } },
      {
        $group: {
          _id: "$title",
          quantitySold: { $sum: "$quantity" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit },
      {
        $project: {
          title: "$_id",
          quantitySold: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    return topProducts;
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts() {
    // Find products where quantity is <= lowStockThreshold
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    })
      .select("chemicalname quantity lowStockThreshold sku category")
      .sort({ quantity: 1 })
      .lean();

    return products;
  }
}

export const analyticsService = new AnalyticsService();
