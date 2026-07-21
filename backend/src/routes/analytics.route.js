import { Router } from "express";
import {
  getDashboardMetrics,
  getRevenueTimeline,
  getTopProducts,
  getLowStockProducts
} from "../controllers/analytics.controller.js";

import { verifyAdminToken } from "../middleware/auth.middleware.js";

const router = Router();

// Secure analytics routes with admin token verification
router.use(verifyAdminToken);

router.get("/dashboard", getDashboardMetrics);
router.get("/revenue", getRevenueTimeline);
router.get("/top-products", getTopProducts);
router.get("/low-stock", getLowStockProducts);

export default router;
