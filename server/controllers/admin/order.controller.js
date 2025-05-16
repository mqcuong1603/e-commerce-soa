// controllers/admin/order.controller.js
import Order from "../../models/order.model.js";
import OrderStatus from "../../models/orderStatus.model.js";
import { ApiError } from "../../middleware/response.middleware.js";
import emailService from "../../services/emailService.js";
import mongoose from "mongoose";

/**
 * Get all orders with filters and pagination
 * Admin can filter by date range and status
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filter params
    const { status, period, startDate, endDate } = req.query;

    // Build query with safer error handling
    const query = {};

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError("Database connection issue", 500);
    }

    // Date filters with validation
    if (period || (startDate && endDate)) {
      const dateQuery = {};

      if (startDate && endDate) {
        try {
          dateQuery.$gte = new Date(startDate);
          dateQuery.$lte = new Date(endDate);
          // Ensure endDate includes the whole day
          dateQuery.$lte.setHours(23, 59, 59, 999);
        } catch (err) {
          console.error("Date parsing error:", err);
          throw new ApiError("Invalid date format", 400);
        }
      } else if (period) {
        // Safer period handling with validation
        const now = new Date();
        dateQuery.$lte = now;

        // Set safer defaults that won't crash if data is malformed
        try {
          switch (period) {
            case "today":
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dateQuery.$gte = today;
              break;
            case "yesterday":
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              yesterday.setHours(0, 0, 0, 0);
              dateQuery.$gte = yesterday;
              dateQuery.$lte = new Date(yesterday);
              dateQuery.$lte.setHours(23, 59, 59, 999);
              break;
            case "week":
              const week = new Date();
              week.setDate(week.getDate() - 7);
              dateQuery.$gte = week;
              break;
            case "month":
              const month = new Date();
              month.setMonth(month.getMonth() - 1);
              dateQuery.$gte = month;
              break;
            default:
              // Default to last 30 days if period is invalid
              const defaultPeriod = new Date();
              defaultPeriod.setDate(defaultPeriod.getDate() - 30);
              dateQuery.$gte = defaultPeriod;
          }
        } catch (err) {
          console.error("Period calculation error:", err);
          // Don't fail, use a safe default
          const defaultPeriod = new Date();
          defaultPeriod.setDate(defaultPeriod.getDate() - 30);
          dateQuery.$gte = defaultPeriod;
        }
      }

      // Add date query if we have date filters
      if (Object.keys(dateQuery).length > 0) {
        query.createdAt = dateQuery;
      }
    }

    // Status filter with better error handling
    let orderIds = [];
    if (status) {
      try {
        // Find all orders with this status (latest status only)
        const orderStatuses = await OrderStatus.aggregate([
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$orderId",
              latestStatus: { $first: "$status" },
              createdAt: { $first: "$createdAt" },
            },
          },
          { $match: { latestStatus: status } },
          { $project: { _id: 1 } },
        ]);

        orderIds = orderStatuses.map((item) => item._id);
        if (orderIds.length === 0) {
          // Return empty result instead of failing
          return res.success({
            orders: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          });
        }
        query._id = { $in: orderIds };
      } catch (err) {
        console.error("Order status filter error:", err);
        // Continue without status filter rather than failing
      }
    }

    // Use safer promises with timeouts
    try {
      // Count total matching orders with timeout
      const countPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Query timeout")),
          5000
        );
        Order.countDocuments(query)
          .then((count) => {
            clearTimeout(timeout);
            resolve(count);
          })
          .catch(reject);
      });

      // Get orders with pagination and timeout
      const ordersPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Query timeout")),
          5000
        );
        Order.find(query)
          .select("orderNumber createdAt email fullName total paymentStatus")
          .populate("status") // Current status (virtual)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .then((orders) => {
            clearTimeout(timeout);
            resolve(orders);
          })
          .catch(reject);
      });

      const [total, orders] = await Promise.all([countPromise, ordersPromise]);

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
      console.error("Order query error:", error);
      throw new ApiError("Error retrieving orders", 500);
    }
  } catch (error) {
    console.error("Order controller error:", error);
    next(error);
  }
};

/**
 * Get order details by ID
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("statusHistory")
      .populate("userId", "fullName email");

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    return res.success(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      throw new ApiError("Invalid status", 400);
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // Get current status
    const currentStatus = await OrderStatus.findOne({ orderId })
      .sort({ createdAt: -1 })
      .limit(1);

    // Prevent illogical status changes
    // Can't go back to earlier status except for special cases
    const currentStatusIndex = validStatuses.indexOf(currentStatus.status);
    const newStatusIndex = validStatuses.indexOf(status);

    // Special cases:
    // 1. Can go to 'cancelled' from 'pending' or 'confirmed'
    // 2. Can't go to any status from 'cancelled' or 'delivered' (final states)
    if (
      currentStatus.status === "cancelled" ||
      currentStatus.status === "delivered"
    ) {
      throw new ApiError(
        `Cannot change status from ${currentStatus.status}`,
        400
      );
    }

    // Ensure logical status progression (can only move forward in the process)
    if (status !== "cancelled" && newStatusIndex < currentStatusIndex) {
      throw new ApiError(
        `Cannot change status from ${currentStatus.status} to ${status}`,
        400
      );
    }

    // Create new status record
    const orderStatus = new OrderStatus({
      orderId,
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    await orderStatus.save();

    // If status is 'cancelled', return inventory
    if (status === "cancelled" && currentStatus.status !== "cancelled") {
      // Handle inventory return process
      // This is done in a try/catch to ensure status is saved even if inventory fails
      try {
        const ProductVariant = require("../../models/productVariant.model.js");

        for (const item of order.items) {
          const variant = await ProductVariant.findById(item.productVariantId);
          if (variant) {
            await variant.increaseInventory(item.quantity);
          }
        }
      } catch (err) {
        console.error("Error returning inventory:", err);
        // Don't stop the status update if inventory update fails
      }
    }

    // Notify customer if needed
    try {
      // Send status update email
      const user = await require("../../models/user.model.js").findById(
        order.userId
      );

      // Only send for certain status changes that are relevant to customers
      if (
        ["confirmed", "shipping", "delivered", "cancelled"].includes(status)
      ) {
        await emailService.sendOrderStatusUpdate({
          email: order.email,
          orderNumber: order.orderNumber,
          status,
          fullName: order.fullName,
        });
      }
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the status update if email fails
    }

    return res.success(
      {
        orderId,
        status,
        previousStatus: currentStatus.status,
      },
      "Order status updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order statistics for dashboard
 */
export const getOrderStatistics = async (req, res, next) => {
  try {
    const { period } = req.query;

    // Define date range
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        // Default to last 30 days
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get count of orders by status
    const ordersByStatus = await OrderStatus.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $sort: {
          orderId: 1,
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$orderId",
          status: { $first: "$status" },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total orders and revenue
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    // Format status counts for easy consumption
    const statusCounts = {};
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
    ];

    // Initialize all statuses with 0
    validStatuses.forEach((status) => {
      statusCounts[status] = 0;
    });

    // Fill in actual counts
    ordersByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Calculate totals
    const stats = {
      totalOrders: orderStats.length > 0 ? orderStats[0].totalOrders : 0,
      totalRevenue: orderStats.length > 0 ? orderStats[0].totalRevenue : 0,
      avgOrderValue: orderStats.length > 0 ? orderStats[0].avgOrderValue : 0,
      statusCounts,
    };

    return res.success(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue data for charts
 * This provides data for time-based charts (by day, week, month)
 */
export const getRevenueChartData = async (req, res, next) => {
  try {
    const { timeframe } = req.query;

    // Define date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    let groupBy = {};

    switch (timeframe) {
      case "week":
        // Last 7 days data by day
        startDate.setDate(startDate.getDate() - 7);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "month":
        // Last 30 days data by day
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "quarter":
        // Last 3 months data by week
        startDate.setMonth(startDate.getMonth() - 3);
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "year":
        // Last 12 months data by month
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      default:
        // Default to last 30 days by day
        startDate.setDate(startDate.getDate() - 30);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    // Get revenue data
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
          "_id.week": 1,
        },
      },
    ]);

    // Format the data for charts
    const chartData = revenueData.map((item) => {
      let label = "";

      if (item._id.day) {
        // Format as date for daily data
        label = `${item._id.year}-${String(item._id.month).padStart(
          2,
          "0"
        )}-${String(item._id.day).padStart(2, "0")}`;
      } else if (item._id.week) {
        // Format as week number for weekly data
        label = `Week ${item._id.week}, ${item._id.year}`;
      } else {
        // Format as month for monthly data
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }

      return {
        label,
        revenue: item.revenue,
        orders: item.orders,
      };
    });

    return res.success({
      timeframe,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};
