import Category from "../../models/category.model.js";

// Add this controller method
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .select("_id name parentId");

    return res.success(categories);
  } catch (error) {
    next(error);
  }
};

// Get parent categories for admin dropdown
export const getParentCategories = async (req, res, next) => {
  try {
    // Only get categories where parentId is null (parent categories)
    const categories = await Category.find({
      parentId: null,
      isActive: true,
    }).sort({ name: 1 });

    return res.success(categories);
  } catch (error) {
    next(error);
  }
};
