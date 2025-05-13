import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { ApiError } from "../middleware/response.middleware.js";
import mongoose from "mongoose";

/**
 * Get reviews for a product
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const objectIdProductId = new mongoose.Types.ObjectId(productId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total reviews for this product
    const total = await Review.countDocuments({ productId: objectIdProductId });

    // Get reviews with pagination
    const reviews = await Review.find({ productId: objectIdProductId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName");

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a review for a product
 */
export const addProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // If authenticated, use user info from req.user
    // If guest, require userName in the body
    const userId = req.user ? req.user._id : null;
    let userName;

    if (userId) {
      // For authenticated users, always use the name from their profile
      userName = req.user.fullName;
    } else {
      // For guests, require userName in request
      userName = req.body.userName;
      if (!userName) {
        throw new ApiError("User name is required for guest reviews", 400);
      }
    }

    // Validate inputs
    if (!productId) {
      throw new ApiError("Product ID is required", 400);
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError("Rating must be between 1 and 5", 400);
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // If user is logged in, check if they already reviewed this product
    if (userId) {
      const existingReview = await Review.findOne({ productId, userId });
      if (existingReview) {
        throw new ApiError("You have already reviewed this product", 400);
      }

      // Optionally: Check if user has purchased the product
      const hasPurchased = await Order.exists({
        userId,
        "items.productId": productId,
        "status.status": "delivered",
      });

      // Create new review with user ID
      const review = new Review({
        productId,
        userId,
        userName, // Use the name from the user's profile
        rating,
        comment,
        isVerifiedPurchase: hasPurchased ? true : false,
      });

      await review.save();
      await product.updateRating();
      return res.success(review, "Review added successfully");
    } else {
      // Guest review (no user ID)
      const review = new Review({
        productId,
        userName,
        rating,
        comment,
        isVerifiedPurchase: false,
      });

      await review.save();
      await product.updateRating();
      return res.success(review, "Review added successfully");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 * Only the owner of the review can update it
 */
export const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError("Rating must be between 1 and 5", 400);
    }

    // Find the review and ensure it belongs to the user
    const review = await Review.findOne({ _id: reviewId, userId });

    if (!review) {
      throw new ApiError(
        "Review not found or you don't have permission to update it",
        404
      );
    }

    // Update review fields
    review.rating = rating;
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Update product's average rating
    const product = await Product.findById(review.productId);
    if (product) {
      await product.updateRating();
    }

    return res.success(review, "Review updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * Only the owner of the review or admin can delete it
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError("Review not found", 404);
    }

    // Check permission - must be owner or admin
    if (
      !isAdmin &&
      review.userId &&
      review.userId.toString() !== userId.toString()
    ) {
      throw new ApiError(
        "You don't have permission to delete this review",
        403
      );
    }

    // Store product ID for updating rating after deletion
    const productId = review.productId;

    // Delete the review
    await Review.deleteOne({ _id: reviewId });

    // Update product's average rating
    const product = await Product.findById(productId);
    if (product) {
      await product.updateRating();
    }

    return res.success({ reviewId }, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews made by the current user
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total reviews by this user
    const total = await Review.countDocuments({ userId });

    // Get reviews with pagination
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("productId", "name slug");

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};
