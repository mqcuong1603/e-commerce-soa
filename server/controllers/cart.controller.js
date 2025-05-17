// controllers/cart.controller.js
import Cart from "../models/cart.model.js";
import ProductVariant from "../models/productVariant.model.js";
import { ApiError } from "../middleware/response.middleware.js";

/**
 * Get cart
 */
export const getCart = async (req, res, next) => {
  try {
    // Get the cart from middleware
    let cart = req.cart;

    // Populate the cart with full product information
    cart = await Cart.findById(cart._id).populate({
      path: "items.productVariantId",
      model: "ProductVariant",
      populate: [
        {
          path: "productId",
          model: "Product",
          select: "name slug brand images",
          populate: {
            path: "images",
            model: "ProductImage",
            select: "imageUrl isMain alt",
          },
        },
        {
          path: "images",
          model: "ProductImage",
        },
      ],
    });

    // Make sure to calculate the subtotal
    const subtotal = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Send response with explicitly calculated subtotal
    req.session.save((err) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({
          success: true,
          data: {
            ...cart.toObject({ virtuals: true }),
            subtotal: subtotal,
          },
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
export const addItemToCart = async (req, res, next) => {
  try {
    const { productVariantId, quantity } = req.body;
    console.log(`Session ID in addItemToCart: ${req.session.id}`);
    console.log(`Cart being used: ${req.cart._id}`);

    if (!productVariantId || !quantity || quantity < 1) {
      throw new ApiError("Invalid product or quantity", 400);
    }

    // Fetch the product variant to get current price
    const variant = await ProductVariant.findById(productVariantId);

    if (!variant || !variant.isActive) {
      throw new ApiError("Product not available", 404);
    }

    // Check if there's enough inventory
    if (variant.inventory < quantity) {
      throw new ApiError(`Only ${variant.inventory} items available`, 400);
    }

    // Get the current price
    const price = variant.currentPrice;

    // Add item to cart
    await req.cart.addItem(productVariantId, quantity, price);

    // Refresh cart from database to ensure consistency
    const updatedCart = await Cart.findById(req.cart._id).populate({
      path: "items.productVariantId",
      model: "ProductVariant",
      populate: [
        {
          path: "productId",
          model: "Product",
          select: "name slug brand images",
          populate: {
            path: "images",
            model: "ProductImage",
            select: "imageUrl isMain alt",
          },
        },
        {
          path: "images",
          model: "ProductImage",
        },
      ],
    });
    req.cart = updatedCart;

    // Ensure session is saved before sending response
    req.session.save((err) => {
      if (err) {
        return next(err);
      }

      return res.success(req.cart, "Item added to cart");
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { productVariantId } = req.params;
    const { quantity } = req.body;
    console.log(`Session ID in updateCartItem: ${req.session.id}`);
    console.log(`Cart being used: ${req.cart._id}`);

    if (!quantity || quantity < 1) {
      throw new ApiError("Invalid quantity", 400);
    }

    // Fetch the product variant to check inventory
    const variant = await ProductVariant.findById(productVariantId);

    if (!variant || !variant.isActive) {
      throw new ApiError("Product not available", 404);
    }

    // Check if there's enough inventory
    if (variant.inventory < quantity) {
      throw new ApiError(`Only ${variant.inventory} items available`, 400);
    }

    // Update the cart item
    await req.cart.updateItem(productVariantId, quantity);

    // Refresh cart from database to ensure consistency
    const updatedCart = await Cart.findById(req.cart._id).populate({
      path: "items.productVariantId",
      model: "ProductVariant",
      populate: [
        {
          path: "productId",
          model: "Product",
          select: "name slug brand images",
          populate: {
            path: "images",
            model: "ProductImage",
            select: "imageUrl isMain alt",
          },
        },
        {
          path: "images",
          model: "ProductImage",
        },
      ],
    });
    req.cart = updatedCart;

    // Ensure session is saved before sending response
    req.session.save((err) => {
      if (err) {
        return next(err);
      }

      return res.success(req.cart, "Cart updated");
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (req, res, next) => {
  try {
    const { productVariantId } = req.params;
    console.log(`Session ID in removeCartItem: ${req.session.id}`);
    console.log(`Cart being used: ${req.cart._id}`);

    // Remove item from cart
    await req.cart.removeItem(productVariantId);

    // Refresh cart from database to ensure consistency
    const updatedCart = await Cart.findById(req.cart._id).populate({
      path: "items.productVariantId",
      model: "ProductVariant",
      populate: [
        {
          path: "productId",
          model: "Product",
          select: "name slug brand images",
          populate: {
            path: "images",
            model: "ProductImage",
            select: "imageUrl isMain alt",
          },
        },
        {
          path: "images",
          model: "ProductImage",
        },
      ],
    });
    req.cart = updatedCart;

    // Ensure session is saved before sending response
    req.session.save((err) => {
      if (err) {
        return next(err);
      }

      return res.success(req.cart, "Item removed from cart");
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req, res, next) => {
  try {
    console.log(`Session ID in clearCart: ${req.session.id}`);
    console.log(`Cart being used: ${req.cart._id}`);

    // Check if this is an API request or from order completion
    const isDirectApiCall =
      req.originalUrl.includes("/api/cart") && req.method === "DELETE";

    if (isDirectApiCall) {
      // Clear items but keep the cart for API calls
      await req.cart.clearCart();

      // Refresh cart from database to ensure consistency
      const updatedCart = await Cart.findById(req.cart._id).populate({
        path: "items.productVariantId",
        model: "ProductVariant",
        populate: [
          {
            path: "productId",
            model: "Product",
            select: "name slug brand images",
            populate: {
              path: "images",
              model: "ProductImage",
              select: "imageUrl isMain alt",
            },
          },
          {
            path: "images",
            model: "ProductImage",
          },
        ],
      });
      req.cart = updatedCart;

      // Ensure session is saved before sending response
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        return res.success(req.cart, "Cart cleared");
      });
    } else {
      // For internal calls, delete the cart completely
      // This shouldn't be reached since we're now using deleteCart() in order controller
      await req.cart.deleteCart();
      delete req.session.cartId;

      // If we need to send a response
      if (res.success) {
        return res.success(null, "Cart deleted");
      } else {
        next();
      }
    }
  } catch (error) {
    console.error("Error in clearCart:", error);
    next(error);
  }
};
