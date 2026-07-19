import { Router } from "express";
import {
  getDashboardMetrics,
  getRevenueTimeline,
  getTopProducts
} from "../controllers/analytics.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAdminToken } from "../middleware/auth.middleware.js";

const router = Router();

// Secure analytics routes with admin token verification
router.use(verifyAdminToken);

router.get("/dashboard", asyncHandler(getDashboardMetrics));
router.get("/revenue", asyncHandler(getRevenueTimeline));
router.get("/top-products", asyncHandler(getTopProducts));

export default router;
