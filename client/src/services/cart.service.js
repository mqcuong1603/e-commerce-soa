import api from "./api";

/**
 * Cart service module
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
    return api.post("/cart/items", { productVariantId, quantity });
  },

  /**
   * Update cart item quantity
   * @param {string} productVariantId - Product variant ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  updateItem: async (productVariantId, quantity) => {
    return api.put(`/cart/items/${productVariantId}`, { quantity });
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
    return api.post("/orders/verify-discount", { code });
  },

  /**
   * Apply loyalty points to get discount estimate
   * @param {number} points - Number of loyalty points to apply
   * @returns {Promise<Object>} Points value and new total
   */
  applyLoyaltyPoints: async (points) => {
    return api.post("/orders/user/apply-loyalty-points", { points });
  },
};

export default cartService;
