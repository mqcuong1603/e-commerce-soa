import express from "express";
import {
  getLandingPageProducts,
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
} from "../controllers/product.controller.js";

const router = express.Router();

// Landing page products (new, bestsellers, and by category)
router.get("/landing", getLandingPageProducts);

// Get all products with pagination and filtering
router.get("/", getAllProducts);

// Get products by category
router.get("/category/:slug", getProductsByCategory);

// Get product details by slug
router.get("/:slug", getProductBySlug);

export default router;
