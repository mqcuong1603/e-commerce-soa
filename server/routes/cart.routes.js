// routes/cart.routes.js
import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { cartMiddleware } from "../middleware/cart.middleware.js";
import { optionalAuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply middleware to all cart routes
router.use(optionalAuthMiddleware);
router.use(cartMiddleware);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/items", addItemToCart);

// Update item quantity
router.put("/items/:productVariantId", updateCartItem);

// Remove item from cart
router.delete("/items/:productVariantId", removeCartItem);

// Clear cart
router.delete("/", clearCart);

export default router;
