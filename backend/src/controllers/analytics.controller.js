import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { analyticsService } from "../services/analytics.service.js";

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get key metrics for the admin dashboard
 * @access  Private (Admin)
 */
export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getDashboardMetrics();
  return res.status(200).json(new ApiResponse(200, result, "Dashboard metrics retrieved successfully"));
});

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue grouped by day for the last N days
 * @access  Private (Admin)
 */
export const getRevenueTimeline = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const result = await analyticsService.getRevenueTimeline(days);
  return res.status(200).json(new ApiResponse(200, result, "Revenue timeline retrieved successfully"));
});

/**
 * @route   GET /api/analytics/top-products
 * @desc    Get top selling products
 * @access  Private (Admin)
 */
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const topProducts = await analyticsService.getTopProducts(limit);
  return res.status(200).json(new ApiResponse(200, topProducts, "Top products retrieved successfully"));
});

/**
 * @route   GET /api/analytics/low-stock
 * @desc    Get products that are at or below their low stock threshold
 * @access  Private (Admin)
 */
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await analyticsService.getLowStockProducts();
  return res.status(200).json(new ApiResponse(200, products, "Low stock products retrieved successfully"));
});
