// controllers/order.controller.js
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";
import DiscountCode from "../models/discountCode.model.js";
import User from "../models/user.model.js";
import ProductVariant from "../models/productVariant.model.js";
import Address from "../models/address.model.js";
import Cart from "../models/cart.model.js";
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

    // Double check that we're using the correct cart from the session
    const sessionCartId = req.session.cartId;
    console.log(
      `Cart ID from session: ${sessionCartId}, Current cart: ${req.cart?._id}`
    );

    // If there's a mismatch, fetch the correct cart
    if (sessionCartId && sessionCartId !== req.cart?._id?.toString()) {
      console.log(
        "Cart mismatch detected, fetching the correct cart from session"
      );
      const sessionCart = await Cart.findById(sessionCartId).populate({
        path: "items.productVariantId",
        populate: [
          {
            path: "productId",
            select: "name images",
            populate: { path: "images" },
          },
          { path: "images" },
        ],
      });

      if (sessionCart && sessionCart.items.length > 0) {
        console.log(
          `Using session cart with ${
            sessionCart.items.length
          } items instead of cart with ${req.cart?.items?.length || 0} items`
        );
        req.cart = sessionCart;
      }
    }

    // Debug cart state
    console.log(
      `Creating order with cart: ${req.cart?._id}, Items count: ${
        req.cart?.items?.length || 0
      }`
    );

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      throw new ApiError("Missing required fields", 400);
    }

    // Validate cart has items
    if (!req.cart || !req.cart.items || req.cart.items.length === 0) {
      throw new ApiError(
        "Your cart is empty. Please add items before checking out.",
        400
      );
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
      paymentMethod: paymentMethod, // Add paymentMethod here
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
          .populate({
            path: "productId",
            select: "name images",
            populate: { path: "images" },
          })
          .populate("images")
          .exec();
      }

      // Check inventory
      if (variant.inventory < item.quantity) {
        throw new ApiError(
          `Only ${variant.inventory} units of ${variant.productId.name} - ${variant.name} available`,
          400
        );
      } // Get the product image URL - first check variant image, then product image
      let productImageUrl = null;

      // Check variant for images
      if (variant.images && variant.images.length > 0) {
        // Find main image first, fallback to first image
        const mainImage = variant.images.find((img) => img.isMain);
        productImageUrl = mainImage
          ? mainImage.imageUrl
          : variant.images[0].imageUrl;
      }
      // If no variant image, check product images
      else if (
        variant.productId.images &&
        variant.productId.images.length > 0
      ) {
        const mainImage = variant.productId.images.find((img) => img.isMain);
        productImageUrl = mainImage
          ? mainImage.imageUrl
          : variant.productId.images[0].imageUrl;
      }

      // Add item to order
      orderData.items.push({
        productVariantId: variant._id,
        productName: variant.productId.name,
        variantName: variant.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
        productImageUrl: productImageUrl,
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
    } // Apply loyalty points if authenticated user
    if (req.user && loyaltyPointsUsed > 0) {
      // Verify user has enough points
      if (req.user.loyaltyPoints < loyaltyPointsUsed) {
        throw new ApiError(
          `You only have ${req.user.loyaltyPoints} loyalty points available`,
          400
        );
      }

      console.log(`Applying ${loyaltyPointsUsed} loyalty points for order`);

      // Convert points to VND (1 point = 1,000 VND)
      const pointsValue = loyaltyPointsUsed * 1000;

      // Limit points usage to subtotal - discount
      const maxApplicable = orderData.subtotal - orderData.discountAmount;
      const appliedValue = Math.min(pointsValue, maxApplicable);
      const actualPointsUsed = Math.floor(appliedValue / 1000);

      // Only apply points if the actual value is greater than zero
      if (actualPointsUsed > 0) {
        orderData.loyaltyPointsUsed = actualPointsUsed;
        console.log(
          `Applied ${actualPointsUsed} loyalty points (${appliedValue} VND) to order`
        );
      } else {
        console.log(`No loyalty points applied - value too small`);
        orderData.loyaltyPointsUsed = 0;
      }
    }

    // Calculate total
    orderData.total =
      orderData.subtotal +
      orderData.shippingFee +
      orderData.tax -
      orderData.discountAmount -
      orderData.loyaltyPointsUsed * 1000; // Calculate loyalty points earned (10% of total, rounded down)
    orderData.loyaltyPointsEarned = Math.floor((orderData.total * 0.1) / 1000);

    // Save address for future orders if requested and user is authenticated
    if (req.user && shippingAddress.saveAddress) {
      try {
        // Check if the address already exists
        const existingAddress = await Address.findOne({
          userId: req.user._id,
          addressLine1: shippingAddress.addressLine1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
        });

        if (!existingAddress) {
          // Create new address
          const newAddress = new Address({
            userId: req.user._id,
            fullName: shippingAddress.fullName,
            phoneNumber: shippingAddress.phoneNumber,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            isDefault: false, // Don't make it default automatically
          });

          await newAddress.save();
          console.log(`Saved new address for user ${req.user._id}`);
        } else {
          console.log(`Address already exists for user ${req.user._id}`);
        }
      } catch (error) {
        console.error("Error saving address:", error);
        // Don't fail the order if saving address fails
      }
    }

    // Debug log to check items
    console.log("Order items before saving:", JSON.stringify(orderData.items));

    // Check if items array is empty and throw clear error if it is
    if (!orderData.items || orderData.items.length === 0) {
      console.error("Cart has no items, cannot create order");
      throw new ApiError(
        "Your cart is empty. Please add items before checking out.",
        400
      );
    }

    // Create the order
    const order = new Order(orderData);
    try {
      await order.save();
    } catch (err) {
      console.error("Error saving order:", err.message);
      throw new ApiError(`Error creating order: ${err.message}`, 400);
    }

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
    } // Update inventory
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.productVariantId);
      await variant.decreaseInventory(item.quantity);
    }

    // Track cart ID for new users before we delete it
    const cartIdBeforeDelete = req.cart._id.toString();

    // Delete the cart completely instead of just clearing it
    await req.cart.deleteCart();

    // Remove the cartId from session
    delete req.session.cartId;

    // If a new account was created from guest checkout, create a new empty cart for them
    // This will ensure they have a cart when they log in later
    if (accountCreated && guestUser) {
      const newUserCart = new Cart({
        userId: guestUser._id,
        sessionId: req.session.id,
      });
      await newUserCart.save();
      console.log(
        `Created new empty cart ${newUserCart._id} for new user ${guestUser._id} after order completion`
      );
    }

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
    }).populate({
      path: "items.productVariantId",
      model: "ProductVariant",
      populate: [
        {
          path: "productId",
          model: "Product",
          select: "name slug images", // Ensure slug and images are selected
          populate: {
            path: "images",
            model: "ProductImage",
            select: "imageUrl isMain",
          },
        },
        {
          path: "images", // Populate images of the variant itself
          model: "ProductImage",
          select: "imageUrl isMain",
        },
      ],
    });

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    // Populate order status history
    await order.populate("statusHistory");

    // Process items to add productImageUrl and productSlug
    const orderObject = order.toObject ? order.toObject() : { ...order };
    orderObject.items = orderObject.items.map((item) => {
      let productImageUrl = null;
      let productSlug = null;
      const variant = item.productVariantId;

      if (variant) {
        // Get product slug
        if (variant.productId) {
          productSlug = variant.productId.slug;
        }

        // Check variant images
        if (variant.images && variant.images.length > 0) {
          const mainImage = variant.images.find((img) => img.isMain);
          productImageUrl = mainImage
            ? mainImage.imageUrl
            : variant.images[0].imageUrl;
        }
        // If no variant image, check product images (via populated productId)
        else if (
          variant.productId &&
          variant.productId.images &&
          variant.productId.images.length > 0
        ) {
          const mainImage = variant.productId.images.find((img) => img.isMain);
          productImageUrl = mainImage
            ? mainImage.imageUrl
            : variant.productId.images[0].imageUrl;
        }
      }
      return {
        ...item,
        productImageUrl:
          productImageUrl || "/images/placeholders/product-placeholder.png", // Fallback placeholder
        productSlug: productSlug, // Add productSlug
      };
    });

    return res.success(orderObject);
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
    const { status, startDate, endDate } = req.query;

    const queryConditions = { userId: req.user._id };

    if (startDate && endDate) {
      queryConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };
    } else if (startDate) {
      queryConditions.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      queryConditions.createdAt = {
        $lte: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };
    }

    let ordersQuery = Order.find(queryConditions)
      .populate({
        path: "items.productVariantId",
        model: "ProductVariant",
        populate: [
          {
            path: "productId",
            model: "Product",
            select: "name slug images", // Ensure 'images' is selected for product
            populate: {
              path: "images",
              model: "ProductImage",
              select: "imageUrl isMain",
            },
          },
          {
            path: "images", // Populate images of the variant itself
            model: "ProductImage",
            select: "imageUrl isMain",
          },
        ],
      })
      .populate("statusHistory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const ordersFromDB = await ordersQuery.exec();
    const totalOrders = await Order.countDocuments(queryConditions);

    let processedOrders = ordersFromDB.map((order) => {
      const orderObject = order.toObject ? order.toObject() : { ...order };
      orderObject.items = orderObject.items.map((item) => {
        let productImageUrl = null;
        const variant = item.productVariantId;

        if (variant) {
          // Check variant images
          if (variant.images && variant.images.length > 0) {
            const mainImage = variant.images.find((img) => img.isMain);
            productImageUrl = mainImage
              ? mainImage.imageUrl
              : variant.images[0].imageUrl;
          }
          // If no variant image, check product images (via populated productId)
          else if (
            variant.productId &&
            variant.productId.images &&
            variant.productId.images.length > 0
          ) {
            const mainImage = variant.productId.images.find(
              (img) => img.isMain
            );
            productImageUrl = mainImage
              ? mainImage.imageUrl
              : variant.productId.images[0].imageUrl;
          }
        }
        return {
          ...item,
          productImageUrl:
            productImageUrl || "/images/placeholders/product-placeholder.png", // Fallback placeholder
        };
      });
      return orderObject;
    });

    let filteredOrders = processedOrders;
    if (status) {
      filteredOrders = processedOrders.filter((order) => {
        if (order.statusHistory && order.statusHistory.length > 0) {
          const currentStatusEntry = order.statusHistory.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )[0];
          return currentStatusEntry && currentStatusEntry.status === status;
        }
        return false;
      });
    }

    const finalTotal = status ? filteredOrders.length : totalOrders;

    res.success({
      orders: filteredOrders,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
        hasNextPage: page * limit < finalTotal,
        hasPrevPage: page > 1,
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
