import api from "./api";

/**
 * Authentication service module
 */
const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Response with token and user data
   */
  login: async (email, password) => {
    return api.post("/auth/login", { email, password });
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with registration status
   */
  register: async (userData) => {
    return api.post("/auth/register", userData);
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getCurrentUser: async () => {
    return api.get("/users/profile");
  },

  /**
   * Send forgot password request
   * @param {string} email - User email
   * @returns {Promise<Object>} Response with status
   */
  forgotPassword: async (email) => {
    return api.post("/auth/forgot-password", { email });
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with status
   */
  resetPassword: async (token, newPassword) => {
    return api.post(`/auth/reset-password/${token}`, { newPassword });
  },

  /**
   * Update password when logged in
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with status
   */
  updatePassword: async (currentPassword, newPassword) => {
    return api.post("/auth/update-password", { currentPassword, newPassword });
  },
};

export default authService;
