import express from "express";
import * as categoryController from "../../controllers/admin/category.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

// Get all categories
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  categoryController.getAllCategories
);

// Get only parent categories
router.get(
  "/parents",
  authMiddleware,
  adminMiddleware,
  categoryController.getParentCategories
);

// Other category routes
// ...

export default router;
