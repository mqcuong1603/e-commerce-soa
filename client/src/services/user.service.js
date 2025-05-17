import api from "./api";

/**
 * User service module
 */
const userService = {
  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  getUserProfile: async () => {
    return api.get("/users/profile");
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  updateUserProfile: async (profileData) => {
    return api.put("/users/profile", profileData);
  },

  /**
   * Get user's addresses
   * @returns {Promise<Object>} User addresses
   */
  getUserAddresses: async () => {
    return api.get("/users/addresses");
  },

  /**
   * Add new address
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} New address
   */
  addAddress: async (addressData) => {
    return api.post("/users/addresses", addressData);
  },

  /**
   * Update existing address
   * @param {string} addressId - Address ID
   * @param {Object} addressData - Updated address data
   * @returns {Promise<Object>} Updated address
   */
  updateAddress: async (addressId, addressData) => {
    return api.put(`/users/addresses/${addressId}`, addressData);
  },

  /**
   * Delete address
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} Deletion status
   */
  deleteAddress: async (addressId) => {
    return api.delete(`/users/addresses/${addressId}`);
  },

  /**
   * Set address as default
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} Updated address
   */
  setDefaultAddress: async (addressId) => {
    return api.put(`/users/addresses/${addressId}/default`);
  },

  /**
   * Get user's loyalty points
   * @returns {Promise<Object>} Loyalty points data
   */
  getLoyaltyPoints: async () => {
    return api.get("/users/loyalty-points");
  },

  /**
   * Get user's loyalty points history
   * @param {Object} params - Query parameters for pagination
   * @returns {Promise<Object>} Loyalty points history with pagination
   */
  getLoyaltyPointsHistory: async (params = {}) => {
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

    return api.get(
      `/users/loyalty-points/history${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Get user's reviews
   * @param {Object} params - Query parameters for pagination
   * @returns {Promise<Object>} User reviews with pagination
   */
  getUserReviews: async (params = {}) => {
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

    return api.get(`/reviews/user${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Update user's review
   * @param {string} reviewId - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise<Object>} Updated review
   */
  updateReview: async (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },

  /**
   * Delete user's review
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Deletion status
   */
  deleteReview: async (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },

  /**
   * Deactivate user account
   * @returns {Promise<Object>} Deactivation status
   */
  deactivateAccount: async () => {
    return api.put("/users/deactivate");
  },
};

export default userService;
