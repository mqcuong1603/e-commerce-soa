// controllers/order.controller.js
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";
import DiscountCode from "../models/discountCode.model.js";
import User from "../models/user.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Address from "../models/address.model.js";
import { ApiError } from "../middleware/response.middleware.js";
import emailService from "../services/emailService.js";
import crypto from "crypto";

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXX (where XXXX is a random alphanumeric string)
 */
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

/**
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      discountCode,
      loyaltyPointsUsed = 0,
      paymentMethod,
      email, // Important for guest checkout
    } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      throw new ApiError("Missing required fields", 400);
    }

    // Ensure we have an email for guest checkout
    if (!req.user && !email) {
      throw new ApiError("Email is required for guest checkout", 400);
    }

    // Generate a random password for the new user
    const generateRandomPassword = () => {
      return crypto.randomBytes(10).toString("hex");
    };

    // Check if this email already exists as a user
    let userId = req.user?._id || null;

    // For guest users (no user logged in but email provided)
    let guestUser = null;
    let accountCreated = false;
    let tempPassword = null;

    if (!req.user && email) {
      // Check if user with this email already exists
      guestUser = await User.findOne({ email });

      // If no existing user, create a new account
      if (!guestUser) {
        // Generate a secure random password
        tempPassword = crypto.randomBytes(8).toString("hex");

        guestUser = new User({
          email: email,
          fullName: shippingAddress.fullName,
          // Set the plain password - the model's pre-save hook will hash it
          passwordHash: tempPassword, // FIXED: Let the model handle hashing
          phoneNumber: shippingAddress.phoneNumber,
          role: "customer",
          status: "active",
          // Save the address as default address
          addresses: [
            {
              fullName: shippingAddress.fullName,
              phoneNumber: shippingAddress.phoneNumber,
              addressLine1: shippingAddress.addressLine1,
              addressLine2: shippingAddress.addressLine2 || "",
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              isDefault: true,
            },
          ],
        });

        await guestUser.save();
        userId = guestUser._id;
        accountCreated = true;

        console.log(`Created new account for guest checkout: ${email}`);
      } else {
        userId = guestUser._id;
      }
    }

    // For a guest user who already exists but doesn't have the address saved
    if (guestUser && !accountCreated) {
      // Check if the user already has this address
      const existingAddress = await Address.findOne({
        userId: guestUser._id,
        addressLine1: shippingAddress.addressLine1,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
      });

      // If no matching address, save this one
      if (!existingAddress) {
        const newAddress = new Address({
          userId: guestUser._id,
          fullName: shippingAddress.fullName,
          phoneNumber: shippingAddress.phoneNumber,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          isDefault: !(await Address.findOne({ userId: guestUser._id })), // Make default if no other addresses
        });

        await newAddress.save();
      }
    }

    // Build order data with the userId (existing or newly created)
    const orderData = {
      orderNumber: generateOrderNumber(),
      userId: userId,
      email: req.user ? req.user.email : email,
      fullName: shippingAddress.fullName,
      shippingAddress,
      items: [],
      subtotal: 0,
      shippingFee: 35000, // Default shipping fee 35,000 VND
      tax: 0, // No tax by default
      discountAmount: 0,
      loyaltyPointsUsed: 0,
      loyaltyPointsEarned: 0,
      total: 0,
      paymentStatus: "pending",
    };

    // Process cart items
    for (const item of req.cart.items) {
      // Populate variant details if not already
      let variant = item.productVariantId;
      if (!variant.productId) {
        variant = await ProductVariant.findById(item.productVariantId)
          .populate("productId", "name")
          .exec();
      }

      // Check inventory
      if (variant.inventory < item.quantity) {
        throw new ApiError(
          `Only ${variant.inventory} units of ${variant.productId.name} - ${variant.name} available`,
          400
        );
      }

      // Add item to order
      orderData.items.push({
        productVariantId: variant._id,
        productName: variant.productId.name,
        variantName: variant.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      });

      // Add to subtotal
      orderData.subtotal += item.price * item.quantity;
    }

    // Apply discount code if provided
    if (discountCode) {
      const discount = await DiscountCode.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
      });

      if (!discount) {
        throw new ApiError("Invalid discount code", 400);
      }

      if (discount.usedCount >= discount.usageLimit) {
        throw new ApiError("Discount code has reached its usage limit", 400);
      }

      // Calculate discount amount
      orderData.discountCode = discount.code;
      orderData.discountAmount = discount.calculateDiscount(orderData.subtotal);

      // Increment discount usage
      await discount.use();
    }

    // Apply loyalty points if authenticated user
    if (req.user && loyaltyPointsUsed > 0) {
      // Verify user has enough points
      if (req.user.loyaltyPoints < loyaltyPointsUsed) {
        throw new ApiError(
          `You only have ${req.user.loyaltyPoints} loyalty points available`,
          400
        );
      }

      // Convert points to VND (1 point = 1,000 VND)
      const pointsValue = loyaltyPointsUsed * 1000;

      // Limit points usage to subtotal - discount
      const maxApplicable = orderData.subtotal - orderData.discountAmount;
      const appliedValue = Math.min(pointsValue, maxApplicable);
      const actualPointsUsed = Math.floor(appliedValue / 1000);

      orderData.loyaltyPointsUsed = actualPointsUsed;
    }

    // Calculate total
    orderData.total =
      orderData.subtotal +
      orderData.shippingFee +
      orderData.tax -
      orderData.discountAmount -
      orderData.loyaltyPointsUsed * 1000;

    // Calculate loyalty points earned (10% of total, rounded down)
    orderData.loyaltyPointsEarned = Math.floor((orderData.total * 0.1) / 1000);

    // Create the order
    const order = new Order(orderData);
    await order.save();

    // Create initial order status
    const initialStatus = new OrderStatus({
      orderId: order._id,
      status: "pending",
      note: "Order placed successfully",
    });
    await initialStatus.save();

    // If user is authenticated, update loyalty points
    if (req.user) {
      req.user.loyaltyPoints -= orderData.loyaltyPointsUsed;
      req.user.loyaltyPoints += orderData.loyaltyPointsEarned;
      await req.user.save();
    }

    // Update inventory
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.productVariantId);
      await variant.decreaseInventory(item.quantity);
    }

    // Clear the cart
    await req.cart.clearCart();

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    // If a new account was created, send welcome email with password
    if (accountCreated && tempPassword) {
      try {
        await emailService.sendWelcomeEmail({
          email,
          fullName: shippingAddress.fullName,
          password: tempPassword,
          isGuestCheckout: true,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return res.success(
      {
        order,
        message: "Order placed successfully",
        accountCreated: accountCreated,
        tempPassword: accountCreated ? tempPassword : null,
      },
      "Order created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details
 * User must be authenticated and the order must belong to them
 */
export const getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find order and ensure it belongs to the current user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // Populate order status history
    await order.populate("statusHistory");

    return res.success(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's orders with pagination
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only get orders for the authenticated user
    const total = await Order.countDocuments({ userId: req.user._id });
    const orders = await Order.find({ userId: req.user._id })
      .select("orderNumber createdAt total paymentStatus items")
      .populate("status") // Current status (virtual)
      .populate("statusHistory") // Also populate statusHistory for consistency
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Ensure status consistency
    for (const order of orders) {
      if (
        !order.status ||
        (Array.isArray(order.status) && order.status.length === 0)
      ) {
        if (order.statusHistory && order.statusHistory.length > 0) {
          // Use statusHistory if available
          order.status = [{ status: order.statusHistory[0].status }];
        }
      }
    }

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
 * Verify discount code and return amount
 */
export const verifyDiscount = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new ApiError("Discount code is required", 400);
    }

    // Find discount code
    const discount = await DiscountCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!discount) {
      throw new ApiError("Invalid discount code", 400);
    }

    if (discount.usedCount >= discount.usageLimit) {
      throw new ApiError("Discount code has reached its usage limit", 400);
    }

    // Calculate discount amount based on cart total
    const cartTotal = req.cart.total;
    const discountAmount = discount.calculateDiscount(cartTotal);

    return res.success({
      code: discount.code,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      discountAmount,
      remainingUses: discount.remainingUses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply loyalty points to an order calculation
 * Returns how much the order would cost with specified points
 */
export const applyLoyaltyPoints = async (req, res, next) => {
  try {
    const { points } = req.body;

    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }

    if (!points || points < 0) {
      throw new ApiError("Valid points value required", 400);
    }

    // Check if user has enough points
    if (req.user.loyaltyPoints < points) {
      throw new ApiError(
        `You only have ${req.user.loyaltyPoints} loyalty points available`,
        400
      );
    }

    // Get cart total
    const cartTotal = req.cart.total;

    // Convert points to VND (1 point = 1,000 VND)
    const pointsValue = points * 1000;

    // Calculate how much can be applied (can't exceed cart total)
    const appliedValue = Math.min(pointsValue, cartTotal);
    const actualPointsUsed = Math.floor(appliedValue / 1000);

    // Calculate new total
    const newTotal = cartTotal - appliedValue;

    return res.success({
      originalTotal: cartTotal,
      pointsApplied: actualPointsUsed,
      pointsValue: actualPointsUsed * 1000,
      newTotal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order tracking with status history
 */
export const getOrderTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find order and ensure it belongs to the current user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // Get status history
    const statusHistory = await OrderStatus.find({ orderId: order._id })
      .sort({ createdAt: -1 })
      .populate("updatedBy", "fullName");

    return res.success({
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      currentStatus: statusHistory[0],
      statusHistory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an order
 * Only orders in "pending" or "confirmed" status can be cancelled
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Find order and ensure it belongs to the current user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // Get current status
    const currentStatus = await OrderStatus.findOne({ orderId: order._id })
      .sort({ createdAt: -1 })
      .limit(1);

    // Validate if order can be cancelled
    if (!["pending", "confirmed"].includes(currentStatus.status)) {
      throw new ApiError(
        "Order cannot be cancelled as it has already been processed",
        400
      );
    }

    // Create cancellation status
    const cancelStatus = new OrderStatus({
      orderId: order._id,
      status: "cancelled",
      note: reason || "Cancelled by customer",
      updatedBy: req.user._id,
    });
    await cancelStatus.save();

    // Return loyalty points used
    if (order.loyaltyPointsUsed > 0) {
      req.user.loyaltyPoints += order.loyaltyPointsUsed;
      await req.user.save();
    }

    // Return inventory
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.productVariantId);
      if (variant) {
        await variant.increaseInventory(item.quantity);
      }
    }

    return res.success(
      { orderId, status: "cancelled" },
      "Order cancelled successfully"
    );
  } catch (error) {
    next(error);
  }
};
