import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";
import { ApiError } from "../../middleware/response.middleware.js";
import mongoose from "mongoose";

/**
 * Get user statistics for admin dashboard
 */
export const getUserStatistics = async (req, res, next) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get active vs inactive users
    const activeUsers = await User.countDocuments({ status: "active" });
    const inactiveUsers = await User.countDocuments({ status: "inactive" });

    // User roles breakdown
    const adminUsers = await User.countDocuments({ role: "admin" });
    const customerUsers = await User.countDocuments({ role: "customer" });

    return res.success({
      totalUsers,
      newUsers,
      activeUsers,
      inactiveUsers,
      usersByRole: {
        admin: adminUsers,
        customer: customerUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query with filters
    const query = {};

    // Apply search filter if present
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        {
          _id: mongoose.isValidObjectId(req.query.search)
            ? req.query.search
            : null,
        },
      ].filter((item) => item.$id !== null);
    }

    // Apply role filter if present
    if (req.query.role && req.query.role !== "all") {
      query.role = req.query.role;
    }

    // Apply status filter if present
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    // Count total users with this filter
    const total = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select(
        "-passwordHash -passwordSalt -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      users,
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
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
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
 * Update user
 */
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update fields
    if (updateData.fullName) user.fullName = updateData.fullName;
    if (updateData.email) user.email = updateData.email;
    if (updateData.role) user.role = updateData.role;
    if (updateData.status) user.status = updateData.status;
    if (updateData.phone) user.phoneNumber = updateData.phone;
    if (updateData.loyaltyPoints !== undefined)
      user.loyaltyPoints = updateData.loyaltyPoints;

    await user.save();

    return res.success(
      user.toObject({
        transform: (doc, ret) => {
          delete ret.passwordHash;
          delete ret.passwordSalt;
          delete ret.resetPasswordToken;
          delete ret.resetPasswordExpires;
          return ret;
        },
      }),
      "User updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting admin users
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.role === "admin") {
      throw new ApiError("Cannot delete admin users", 403);
    }

    await User.deleteOne({ _id: userId });

    return res.success({ userId }, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      throw new ApiError("Invalid status", 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    user.status = status;
    await user.save();

    return res.success(
      { userId, status },
      `User ${status === "active" ? "activated" : "deactivated"} successfully`
    );
  } catch (error) {
    next(error);
  }
};
