import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStatistics,
} from "../../controllers/admin/user.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Get user statistics for dashboard
router.get("/statistics", getUserStatistics);

// Get all users with filtering and pagination
router.get("/", getAllUsers);

// Get user by ID
router.get("/:userId", getUserById);

// Update user
router.put("/:userId", updateUser);

// Delete user
router.delete("/:userId", deleteUser);

// Update user status
router.patch("/:userId/status", updateUserStatus);

export default router;
