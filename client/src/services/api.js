import axios from "axios";

/**
 * Base API service for making HTTP requests
 */
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Critical for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Handle FormData requests - Don't set Content-Type for multipart/form-data
    // Let the browser set it automatically with the boundary parameter
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // This is the most reliable way to let browser handle it
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  },
  (error) => {
    // Handle unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    // Handle inventory errors
    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.includes("inventory")
    ) {
      return Promise.resolve({
        success: false,
        message:
          error.response.data.message || "Not enough inventory available",
        errors: error.response.data.errors,
        status: error.response.status,
        isInventoryError: true,
      });
    }

    return Promise.resolve({
      success: false,
      message: error.response?.data?.message || "An error occurred",
      errors: error.response?.data?.errors,
      status: error.response?.status,
    });
  }
);

/**
 * Base API methods
 */
const api = {
  /**
   * Perform GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  get: async (endpoint, options = {}) => {
    return axiosInstance.get(endpoint, options);
  },

  /**
   * Perform POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  post: async (endpoint, data, options = {}) => {
    return axiosInstance.post(endpoint, data, options);
  },

  /**
   * Perform DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  delete: async (endpoint, options = {}) => {
    return axiosInstance.delete(endpoint, options);
  },

  /**
   * Perform PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  put: async (endpoint, data, options = {}) => {
    return axiosInstance.put(endpoint, data, options);
  },

  /**
   * Perform PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  patch: async (endpoint, data, options = {}) => {
    return axiosInstance.patch(endpoint, data, options);
  },
};

export default api;
