import express from "express";
import {
  getProductReviews,
  addProductReview,
  updateReview,
  deleteReview,
  getUserReviews,
} from "../controllers/review.controller.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Validation middleware for reviews
const reviewValidator = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Comment must be a string with a maximum of 1000 characters"),
  body("userName")
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage("User name must be between 2 and 50 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error("Validation failed", 400, errors.array());
    }
    next();
  },
];

// Get reviews for a product (no auth required)
router.get("/product/:productId", getProductReviews);

// Add a review to a product (optional auth - can be guest or logged in)
router.post(
  "/product/:productId",
  optionalAuthMiddleware,
  reviewValidator,
  addProductReview
);

// The following routes require authentication

// Get all reviews made by the current user
router.get("/user", authMiddleware, getUserReviews);

// Update user's review
router.put("/:reviewId", authMiddleware, reviewValidator, updateReview);

// Delete user's review
router.delete("/:reviewId", authMiddleware, deleteReview);

export default router;
