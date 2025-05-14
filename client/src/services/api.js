/**
 * Base API service for making HTTP requests
 */
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

/**
 * Helper to build headers with auth token if available
 */
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Helper function to handle API responses
 */
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // If Unauthorized, clear token
    if (response.status === 401) {
      localStorage.removeItem("token");
    }

    // Additional cart-specific error handling
    if (response.status === 400 && data.message.includes("inventory")) {
      // Handle inventory errors specially
      return {
        success: false,
        message: data.message || "Not enough inventory available",
        errors: data.errors,
        status: response.status,
        isInventoryError: true,
      };
    }

    return {
      success: false,
      message: data.message || "An error occurred",
      errors: data.errors,
      status: response.status,
    };
  }

  return {
    success: true,
    data: data.data,
    message: data.message,
  };
};

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
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: { ...getHeaders(), ...options.headers },
        credentials: "include", // Important for session cookies
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API GET Error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },

  /**
   * Perform POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  post: async (endpoint, data, options = {}) => {
    try {
      const headers = { ...getHeaders(), ...(options.headers || {}) };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        credentials: "include", // Important for session cookies
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API POST Error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },

  /**
   * Perform DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  delete: async (endpoint, options = {}) => {
    try {
      const headers = { ...getHeaders(), ...(options.headers || {}) };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
        credentials: "include", // Important for session cookies
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API DELETE Error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },

  /**
   * Perform PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  put: async (endpoint, data, options = {}) => {
    try {
      const headers = { ...getHeaders(), ...(options.headers || {}) };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
        credentials: "include", // Important for session cookies
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API PUT Error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },

  /**
   * Perform PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  patch: async (endpoint, data, options = {}) => {
    try {
      const headers = { ...getHeaders(), ...(options.headers || {}) };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
        credentials: "include", // Important for session cookies
      });

      return handleResponse(response);
    } catch (error) {
      console.error("API PATCH Error:", error);
      return {
        success: false,
        message: error.message || "Network error",
      };
    }
  },
};

export default api;
