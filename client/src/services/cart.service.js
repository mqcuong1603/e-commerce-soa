import api from "./api";

const cartService = {
  /**
   * Fetch the current user's cart
   */
  getCart: async () => {
    return api.get("/cart", { credentials: "include" });
  },

  /**
   * Add item to cart
   */
  addItem: async (productVariantId, quantity = 1) => {
    return api.post(
      "/cart/items",
      { productVariantId, quantity },
      { credentials: "include" }
    );
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (productVariantId, quantity) => {
    return api.put(
      `/cart/items/${productVariantId}`,
      { quantity },
      { credentials: "include" }
    );
  },

  /**
   * Remove item from cart
   */
  removeItem: async (productVariantId) => {
    return api.delete(`/cart/items/${productVariantId}`, {
      credentials: "include",
    });
  },

  /**
   * Clear cart (remove all items)
   */
  clearCart: async () => {
    return api.delete("/cart", { credentials: "include" });
  },

  /**
   * Verify discount code
   */
  verifyDiscount: async (code) => {
    return api.post(
      "/orders/verify-discount",
      { code },
      { credentials: "include" }
    );
  },

  /**
   * Apply loyalty points
   */
  applyLoyaltyPoints: async (points) => {
    return api.post(
      "/orders/user/apply-loyalty-points",
      { points },
      { credentials: "include" }
    );
  },
};

export default cartService;
