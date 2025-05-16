import express from "express";
import * as categoryController from "../../controllers/admin/category.controller.js";
import { isAdmin, isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Add this route to get all categories
router.get("/", isAuth, isAdmin, categoryController.getAllCategories);

// Add this route if missing
router.get("/", isAuth, isAdmin, categoryController.getParentCategories);

// Other category routes
// ...

export default router;
