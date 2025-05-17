// controllers/user.controller.js
import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import { ApiError } from "../middleware/response.middleware.js";
import mongoose from "mongoose";

/**
 * Get user profile
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-passwordHash -passwordSalt -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return res.success(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update fullName field
    if (fullName) user.fullName = fullName;

    // Email update is not allowed
    if (req.body.email && req.body.email !== user.email) {
      return res.error("Email updates are not permitted", 403);
    }

    await user.save();

    // Return updated user without sensitive information
    const updatedUser = await User.findById(user._id).select(
      "-passwordHash -passwordSalt -resetPasswordToken -resetPasswordExpires"
    );

    return res.success(updatedUser, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get all addresses for the current user
 */
export const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.success(addresses);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new address
 */
export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Validate required fields
    if (
      !phoneNumber ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      throw new ApiError("Missing required address fields", 400);
    }

    // Create new address
    const address = new Address({
      userId,
      fullName: fullName || req.user.fullName,
      phoneNumber,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false,
    });

    await address.save();

    return res.success(address, "Address added successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update an address
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new ApiError("Address not found", 404);
    }

    // Update address fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "userId") {
        address[key] = updateData[key];
      }
    });

    await address.save();

    return res.success(address, "Address updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new ApiError("Address not found", 404);
    }

    // Don't allow deletion of the last address or default address without setting a new default
    const addressCount = await Address.countDocuments({ userId });
    if (addressCount === 1) {
      throw new ApiError("Cannot delete the only address", 400);
    }

    if (address.isDefault) {
      throw new ApiError(
        "Cannot delete default address. Please set another address as default first.",
        400
      );
    }

    await Address.deleteOne({ _id: addressId });

    return res.success({ addressId }, "Address deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    // Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new ApiError("Address not found", 404);
    }

    // Update all addresses for this user to set isDefault to false
    await Address.updateMany(
      { userId, _id: { $ne: addressId } },
      { $set: { isDefault: false } }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    return res.success(address, "Default address updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get user order history
 */
export const getOrderHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total orders for this user
    const total = await Order.countDocuments({ userId: req.user._id });

    // Get orders with pagination
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("status"); // Populate virtual for current status

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      orders,
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
 * Get order details by ID
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find order and ensure it belongs to the current user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    }).populate("statusHistory");

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // Make sure order has a status history array, even if empty
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    // Create a default status if no status history exists
    if (order.statusHistory.length === 0) {
      const OrderStatus = mongoose.model("OrderStatus");
      const defaultStatus = new OrderStatus({
        orderId: order._id,
        status: "pending",
        note: "Order created",
        createdAt: order.createdAt,
      });

      try {
        await defaultStatus.save();
        order.statusHistory = [defaultStatus];
      } catch (err) {
        console.error("Error creating default status:", err);
        // Continue even if save fails
      }
    }

    return res.success(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Get loyalty points balance
 */
export const getLoyaltyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("loyaltyPoints");

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return res.success({
      loyaltyPoints: user.loyaltyPoints,
      equivalentValue: user.loyaltyPoints * 1000, // 1 point = 1,000 VND
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user account
 */
export const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Set account status to inactive
    user.status = "inactive";
    await user.save();

    return res.success({ message: "Account deactivated successfully" });
  } catch (error) {
    next(error);
  }
};
