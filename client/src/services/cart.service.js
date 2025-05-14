import api from "./api";

/**
 * Cart service module for handling all cart-related API operations
 */
const cartService = {
  /**
   * Get current cart
   * @returns {Promise<Object>} Cart data
   */
  getCart: async () => {
    return api.get("/cart");
  },

  /**
   * Add item to cart
   * @param {string} productVariantId - Product variant ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Object>} Updated cart
   */
  addItem: async (productVariantId, quantity) => {
    try {
      const response = await api.post("/cart/items", {
        productVariantId,
        quantity,
      });
      return response;
    } catch (error) {
      // Special handling for inventory errors
      if (error.isInventoryError) {
        return {
          success: false,
          message: error.message || "Not enough inventory available",
          isInventoryError: true,
        };
      }
      return {
        success: false,
        message: error.message || "Failed to add item to cart",
      };
    }
  },

  /**
   * Update cart item quantity
   * @param {string} productVariantId - Product variant ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  updateItem: async (productVariantId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${productVariantId}`, {
        quantity,
      });
      return response;
    } catch (error) {
      // Special handling for inventory errors
      if (error.isInventoryError) {
        return {
          success: false,
          message: error.message || "Not enough inventory available",
          isInventoryError: true,
        };
      }
      return {
        success: false,
        message: error.message || "Failed to update cart item",
      };
    }
  },

  /**
   * Remove item from cart
   * @param {string} productVariantId - Product variant ID
   * @returns {Promise<Object>} Updated cart
   */
  removeItem: async (productVariantId) => {
    return api.delete(`/cart/items/${productVariantId}`);
  },

  /**
   * Clear cart (remove all items)
   * @returns {Promise<Object>} Empty cart
   */
  clearCart: async () => {
    return api.delete("/cart");
  },

  /**
   * Verify discount code
   * @param {string} code - Discount code
   * @returns {Promise<Object>} Discount details and calculated amount
   */
  verifyDiscount: async (code) => {
    if (!code || !code.trim()) {
      return {
        success: false,
        message: "Please enter a valid discount code",
      };
    }

    // Enforce 5-character alphanumeric requirement
    const codeRegex = /^[A-Z0-9]{5}$/;
    if (!codeRegex.test(code.toUpperCase())) {
      return {
        success: false,
        message: "Discount code must be 5 alphanumeric characters",
      };
    }

    return api.post("/orders/verify-discount", { code: code.toUpperCase() });
  },

  /**
   * Apply loyalty points to get discount estimate
   * @param {number} points - Number of loyalty points to apply
   * @returns {Promise<Object>} Points value and new total
   */
  applyLoyaltyPoints: async (points) => {
    if (!points || isNaN(points) || points <= 0) {
      return {
        success: false,
        message: "Please enter a valid number of points",
      };
    }

    return api.post("/orders/user/apply-loyalty-points", { points });
  },

  /**
   * Proceed to checkout with current cart
   * This method creates an order from the current cart
   * @param {Object} checkoutData - Checkout data including shipping address, payment info
   * @returns {Promise<Object>} Order confirmation data
   */
  checkout: async (checkoutData) => {
    if (!checkoutData.shippingAddress) {
      return {
        success: false,
        message: "Shipping address is required",
      };
    }

    if (!checkoutData.paymentMethod) {
      return {
        success: false,
        message: "Payment method is required",
      };
    }

    // For guest checkout, ensure email is provided
    if (!checkoutData.email && !localStorage.getItem("token")) {
      return {
        success: false,
        message: "Email is required for guest checkout",
      };
    }

    return api.post("/orders", checkoutData);
  },
};

export default cartService;
