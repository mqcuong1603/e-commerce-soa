// routes/user.routes.js
import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getOrderHistory,
  getOrderDetails,
  getLoyaltyPoints,
  deactivateAccount,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all user routes
router.use(authMiddleware);

// Profile routes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

// Address routes
router.get("/addresses", getUserAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.put("/addresses/:addressId/default", setDefaultAddress);

// Order routes
router.get("/orders", getOrderHistory);
router.get("/orders/:orderId", getOrderDetails);

// Loyalty points
router.get("/loyalty-points", getLoyaltyPoints);

// Account deactivation
router.put("/deactivate", deactivateAccount);

export default router;
