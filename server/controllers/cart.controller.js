// controllers/cart.controller.js
import Cart from "../models/cart.model.js";
import ProductVariant from "../models/productVariant.model.js";
import { ApiError } from "../middleware/response.middleware.js";

/**
 * Get cart
 */
export const getCart = async (req, res, next) => {
  try {
    return res.success(req.cart);
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

    // Get the current price (sale price or regular price)
    const price = variant.currentPrice;

    // Add item to cart
    await req.cart.addItem(productVariantId, quantity, price);

    return res.success(req.cart, "Item added to cart");
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

    return res.success(req.cart, "Cart updated");
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

    // Remove item from cart
    await req.cart.removeItem(productVariantId);

    return res.success(req.cart, "Item removed from cart");
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req, res, next) => {
  try {
    await req.cart.clearCart();
    return res.success(req.cart, "Cart cleared");
  } catch (error) {
    next(error);
  }
};
