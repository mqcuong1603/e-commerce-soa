// controllers/discount.controller.js
import DiscountCode from "../models/discountCode.model.js";
import Order from "../models/order.model.js";
import { ApiError } from "../middleware/response.middleware.js";

/**
 * Get all discount codes (admin only)
 */
export const getAllDiscountCodes = async (req, res, next) => {
  try {
    // Include usage information with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await DiscountCode.countDocuments();

    const discountCodes = await DiscountCode.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "fullName");

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      discountCodes,
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
 * Create a new discount code (admin only)
 */
export const createDiscountCode = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, usageLimit } = req.body;

    // Validate discount type
    if (!["percentage", "fixed"].includes(discountType)) {
      throw new ApiError("Invalid discount type", 400);
    }

    // Validate discount value
    if (
      discountType === "percentage" &&
      (discountValue <= 0 || discountValue > 100)
    ) {
      throw new ApiError("Percentage discount must be between 1 and 100", 400);
    }

    if (discountType === "fixed" && discountValue <= 0) {
      throw new ApiError("Fixed discount must be greater than 0", 400);
    }

    // Validate usage limit
    if (usageLimit <= 0 || usageLimit > 10) {
      throw new ApiError("Usage limit must be between 1 and 10", 400);
    }

    // Check if code already exists
    const existingCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
    });

    if (existingCode) {
      throw new ApiError("Discount code already exists", 400);
    }

    // Create discount code
    const discountCode = new DiscountCode({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      usageLimit,
      createdBy: req.user._id,
    });

    await discountCode.save();

    return res.success(discountCode, "Discount code created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get discount code details (admin only)
 */
export const getDiscountCodeDetails = async (req, res, next) => {
  try {
    const { code } = req.params;

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
    }).populate("createdBy", "fullName");

    if (!discountCode) {
      throw new ApiError("Discount code not found", 404);
    }

    // Get orders that used this discount code
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments({
      discountCode: code.toUpperCase(),
    });

    const orders = await Order.find({ discountCode: code.toUpperCase() })
      .select("orderNumber createdAt email fullName total discountAmount")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      discountCode,
      usage: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a discount code (admin only)
 */
export const deleteDiscountCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
    });

    if (!discountCode) {
      throw new ApiError("Discount code not found", 404);
    }

    // Check if the discount code has been used
    if (discountCode.usedCount > 0) {
      // Instead of deleting, just deactivate
      discountCode.isActive = false;
      await discountCode.save();
      return res.success(
        { code },
        "Discount code has been used and is now deactivated"
      );
    }

    // If never used, we can delete it
    await DiscountCode.deleteOne({ code: code.toUpperCase() });

    return res.success({ code }, "Discount code deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle discount code active status (admin only)
 */
export const toggleDiscountCodeStatus = async (req, res, next) => {
  try {
    const { code } = req.params;

    const discountCode = await DiscountCode.findOne({
      code: code.toUpperCase(),
    });

    if (!discountCode) {
      throw new ApiError("Discount code not found", 404);
    }

    // Toggle active status
    discountCode.isActive = !discountCode.isActive;
    await discountCode.save();

    return res.success(
      { code, isActive: discountCode.isActive },
      `Discount code ${
        discountCode.isActive ? "activated" : "deactivated"
      } successfully`
    );
  } catch (error) {
    next(error);
  }
};
