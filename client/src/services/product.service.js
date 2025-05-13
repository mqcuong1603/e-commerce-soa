import api from "./api";

/**
 * Product service module
 */
const productService = {
  /**
   * Get landing page products (new, bestsellers, and featured by category)
   * @returns {Promise<Object>} Landing page products data
   */
  getLandingPageProducts: async () => {
    return api.get("/products/landing");
  },

  /**
   * Get all products with pagination and filters
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} Products with pagination data
   */
  getAllProducts: async (params = {}) => {
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

    return api.get(`/products${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product details
   */
  getProductBySlug: async (slug) => {
    return api.get(`/products/${slug}`);
  },

  /**
   * Get products by category
   * @param {string} categorySlug - Category slug
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise<Object>} Products in category with pagination data
   */
  getProductsByCategory: async (categorySlug, params = {}) => {
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
      `/products/category/${categorySlug}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  /**
   * Get all categories
   * @returns {Promise<Object>} All categories
   */
  getAllCategories: async () => {
    return api.get("/categories");
  },

  /**
   * Get category tree (hierarchical structure)
   * @returns {Promise<Object>} Category tree
   */
  getCategoryTree: async () => {
    return api.get("/categories/tree");
  },

  /**
   * Get navigation menu categories
   * @returns {Promise<Object>} Categories for menu
   */
  getMenuCategories: async () => {
    return api.get("/categories/menu");
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Object>} Category details
   */
  getCategoryBySlug: async (slug) => {
    return api.get(`/categories/${slug}`);
  },

  /**
   * Get product reviews
   * @param {string} productId - Product ID
   * @param {Object} params - Query parameters for pagination
   * @returns {Promise<Object>} Product reviews with pagination
   */
  getProductReviews: async (productId, params = {}) => {
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
      `/reviews/product/${productId}${queryString ? `?${queryString}` : ""}`
    );
  },

  /**
   * Add product review
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise<Object>} Review submission result
   */
  addProductReview: async (productId, reviewData) => {
    return api.post(`/reviews/product/${productId}`, reviewData);
  },
};

export default productService;
