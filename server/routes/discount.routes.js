// routes/discount.routes.js
import express from "express";
import {
  getAllDiscountCodes,
  createDiscountCode,
  getDiscountCodeDetails,
  deleteDiscountCode,
  toggleDiscountCodeStatus,
} from "../controllers/discount.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// All discount routes require admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all discount codes
router.get("/", getAllDiscountCodes);

// Create a new discount code
router.post("/", createDiscountCode);

// Get discount code details
router.get("/:code", getDiscountCodeDetails);

// Delete discount code
router.delete("/:code", deleteDiscountCode);

// Toggle discount code active status
router.patch("/:code/toggle", toggleDiscountCodeStatus);

export default router;
