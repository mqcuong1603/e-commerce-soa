import api from "./api";

/**
 * Order service module
 */
const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} New order data
   */
  createOrder: async (orderData) => {
    return api.post("/orders", orderData);
  },

  /**
   * Get user's order history with pagination
   * @param {Object} params - Query parameters for pagination
   * @returns {Promise<Object>} User orders with pagination data
   */
  getUserOrders: async (params = {}) => {
    // Build query string from params
    const queryString = Object.keys(params)
      .filter(
        (key) =>
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
      )
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");

    return api.get(`/orders/user${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get specific order details
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrderDetails: async (orderId) => {
    return api.get(`/orders/user/${orderId}`);
  },

  /**
   * Get order tracking information
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order tracking details
   */
  getOrderTracking: async (orderId) => {
    return api.get(`/orders/user/${orderId}/tracking`);
  },

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {Object} data - Cancellation reason
   * @returns {Promise<Object>} Cancellation status
   */
  cancelOrder: async (orderId, data = {}) => {
    return api.post(`/orders/user/${orderId}/cancel`, data);
  },
};

export default orderService;
