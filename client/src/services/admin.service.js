import api from "./api";

const adminService = {
  // Dashboard
  getOrderStatistics: () => api.get("/admin/orders/statistics"),
  getBestSellingProducts: () => api.get("/admin/products/stats/best-selling"),
  getUserStatistics: () => api.get("/admin/users/statistics"),
  getRevenueChartData: (timeframe) =>
    api.get(`/admin/orders/revenue-chart?timeframe=${timeframe}`),
  getCustomRevenueChartData: (startDate, endDate) =>
    api.get(
      `/admin/orders/revenue-chart?startDate=${startDate}&endDate=${endDate}`
    ),

  // Orders
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page);
    if (params.limit) queryParams.set("limit", params.limit);
    if (params.status) queryParams.set("status", params.status);
    if (params.period) queryParams.set("period", params.period);
    if (params.startDate) queryParams.set("startDate", params.startDate);
    if (params.endDate) queryParams.set("endDate", params.endDate);

    return api.get(`/admin/orders?${queryParams.toString()}`);
  },
  getOrderDetails: (orderId) => api.get(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId, statusData) =>
    api.patch(`/admin/orders/${orderId}/status`, statusData),

  // Discounts
  getDiscounts: (page = 1, limit = 20) =>
    api.get(`/discounts?page=${page}&limit=${limit}`),
  getDiscountDetails: (code) => api.get(`/discounts/${code}`),
  createDiscount: (discountData) => api.post("/discounts", discountData),
  toggleDiscountStatus: (code) => api.patch(`/discounts/${code}/toggle`),
  deleteDiscount: (code) => api.delete(`/discounts/${code}`),

  // Users management
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page);
    if (params.limit) queryParams.set("limit", params.limit);
    if (params.search) queryParams.set("search", params.search);
    if (params.role) queryParams.set("role", params.role);
    if (params.status) queryParams.set("status", params.status);

    return api.get(`/admin/users?${queryParams.toString()}`);
  },
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateUserStatus: (userId, statusData) =>
    api.patch(`/admin/users/${userId}/status`, statusData),

  // Products management
  getProductsAdmin: (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page);
    if (params.limit) queryParams.set("limit", params.limit);
    if (params.search) queryParams.set("search", params.search);
    if (params.category) queryParams.set("category", params.category);
    if (params.status) queryParams.set("status", params.status);
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.order) queryParams.set("order", params.order);

    return api.get(`/admin/products?${queryParams.toString()}`);
  },
  getProductDetails: (productId) => api.get(`/admin/products/${productId}`),
  createProduct: (productData) => api.post("/admin/products", productData),
  updateProduct: (productId, productData) =>
    api.put(`/admin/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/admin/products/${productId}`),
  updateProductStatus: (productId, statusData) => {
    return api.patch(`/admin/products/${productId}/status`, statusData);
  },

  // Product Variants
  getProductVariants: (productId) =>
    api.get(`/admin/products/${productId}/variants`),
  createProductVariant: (productId, variantData) =>
    api.post(`/admin/products/${productId}/variants`, variantData),
  updateProductVariant: (productId, variantId, variantData) =>
    api.put(`/admin/products/${productId}/variants/${variantId}`, variantData),
  deleteProductVariant: (productId, variantId) =>
    api.delete(`/admin/products/${productId}/variants/${variantId}`),

  // Product Images
  updateProductImage: (productId, imageId, imageData) => {
    return api.put(`/admin/products/${productId}/images/${imageId}`, imageData);
  },
  uploadProductImage: (productId, imageData) => {
    // If imageData is already a FormData object, use it directly
    let formData;
    if (imageData instanceof FormData) {
      formData = imageData;
    } else {
      // Otherwise, create a new FormData object from the provided data
      formData = new FormData();
      formData.append("image", imageData.file);
      if (imageData.isMain !== undefined)
        formData.append("isMain", imageData.isMain);
      if (imageData.variantId)
        formData.append("variantId", imageData.variantId);
    }

    // Return with proper FormData handling
    return api.post(`/admin/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  deleteProductImage: (productId, imageId) => {
    return api.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  // Categories
  getCategories: () => {
    return api.get("/admin/categories");
  },

  // Get only parent categories
  getParentCategories: () => {
    return api.get("/admin/categories/parents");
  },
};

export default adminService;
