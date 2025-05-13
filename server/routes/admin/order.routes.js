// routes/admin/order.routes.js
import express from "express";
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrderStatistics,
  getRevenueChartData,
} from "../../controllers/admin/order.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all orders with filtering and pagination
router.get("/", getAllOrders);

// Get order statistics for dashboard
router.get("/statistics", getOrderStatistics);

// Get revenue chart data
router.get("/revenue-chart", getRevenueChartData);

// Get order details
router.get("/:orderId", getOrderDetails);

// Update order status
router.patch("/:orderId/status", updateOrderStatus);

export default router;
