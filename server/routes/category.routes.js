// routes/category.routes.js
import express from "express";
import {
  getAllCategories,
  getCategoryTree,
  getMenuCategories,
  getCategoryBySlug,
} from "../controllers/category.controller.js";

const router = express.Router();

// Get all categories
router.get("/", getAllCategories);

// Get category tree
router.get("/tree", getCategoryTree);

// Get menu categories
router.get("/menu", getMenuCategories);

// Get category by slug
router.get("/:slug", getCategoryBySlug);

export default router;
