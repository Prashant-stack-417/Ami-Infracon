import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get key metrics for the admin dashboard
 * @access  Private (Admin)
 */
export const getDashboardMetrics = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalProducts = await Product.countDocuments();

  // Total Revenue (Only completed or processing orders)
  const revenueResult = await Order.aggregate([
    { $match: { status: { $in: ["completed", "processing", "pending"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return res.json(
    new ApiResponse(200, {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue
    }, "Dashboard metrics retrieved successfully")
  );
};

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue grouped by day for the last N days
 * @access  Private (Admin)
 */
export const getRevenueTimeline = async (req, res) => {
  const days = parseInt(req.query.days) || 7;
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

  return res.json(
    new ApiResponse(200, result, "Revenue timeline retrieved successfully")
  );
};

/**
 * @route   GET /api/analytics/top-products
 * @desc    Get top selling products
 * @access  Private (Admin)
 */
export const getTopProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

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

  return res.json(
    new ApiResponse(200, topProducts, "Top products retrieved successfully")
  );
};

/**
 * @route   GET /api/analytics/low-stock
 * @desc    Get products that are at or below their low stock threshold
 * @access  Private (Admin)
 */
export const getLowStockProducts = async (req, res) => {
  // Find products where quantity is <= lowStockThreshold
  // We use $expr to compare two document fields
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
  })
    .select("chemicalname quantity lowStockThreshold sku category")
    .sort({ quantity: 1 })
    .lean();

  return res.json(
    new ApiResponse(200, products, "Low stock products retrieved successfully")
  );
};
