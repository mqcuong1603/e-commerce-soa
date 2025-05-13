// routes/order.routes.js
import express from "express";
import {
  createOrder,
  getOrder,
  getUserOrders,
  verifyDiscount,
  applyLoyaltyPoints,
  getOrderTracking,
  cancelOrder,
} from "../controllers/order.controller.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware.js";
import { cartMiddleware } from "../middleware/cart.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
// Verify discount code (guest checkout can use discount codes)
router.post(
  "/verify-discount",
  optionalAuthMiddleware,
  cartMiddleware,
  verifyDiscount
);

// Routes that require cart but optional authentication
router.use(optionalAuthMiddleware);
router.use(cartMiddleware);

// Create a new order (can be done by guest or authenticated user)
router.post("/", createOrder);

// Routes that require authentication
router.use("/user", authMiddleware);

// Get user's orders with pagination
router.get("/user", getUserOrders);

// Get specific order details (must be authenticated and own the order)
router.get("/user/:orderId", getOrder);

// Get order tracking information with status history
router.get("/user/:orderId/tracking", getOrderTracking);

// Apply loyalty points to an order
router.post("/user/apply-loyalty-points", applyLoyaltyPoints);

// Cancel an order (only possible for orders in certain statuses)
router.post("/user/:orderId/cancel", cancelOrder);

export default router;
