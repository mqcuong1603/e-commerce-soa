// services/discount.service.js
import apiClient from "./api";

const discountService = {
  getAvailableDiscounts: () => {
    return apiClient.get("/discounts/available");
  },
};

export default discountService;
