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
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: getHeaders(),
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
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
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
   * Perform PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
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
   * Perform DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: getHeaders(),
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
   * Perform PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} Response data
   */
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
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
