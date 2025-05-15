import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { cartMiddleware } from "../middleware/cart.middleware.js";

const router = express.Router();

// Apply middleware to all cart routes
router.use(cartMiddleware); // Then use cart middleware

// Routes
router.get("/", getCart);
router.post("/items", addItemToCart);
router.put("/items/:productVariantId", updateCartItem);
router.delete("/items/:productVariantId", removeCartItem);
router.delete("/", clearCart);

export default router;
