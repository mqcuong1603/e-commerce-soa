// controllers/category.controller.js
import Category from "../models/category.model.js";
import { ApiError } from "../middleware/response.middleware.js";

/**
 * Get all categories
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      sortOrder: 1,
    });

    return res.success(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get categories in a tree structure (parent-child relationship)
 */
export const getCategoryTree = async (req, res, next) => {
  try {
    const categoryTree = await Category.getTree();
    return res.success(categoryTree);
  } catch (error) {
    next(error);
  }
};

/**
 * Get categories for navigation menu
 */
export const getMenuCategories = async (req, res, next) => {
  try {
    // Get main categories (parent is null) that are active
    const mainCategories = await Category.find({
      parentId: null,
      isActive: true,
    }).sort({ sortOrder: 1 });

    // For each main category, get its immediate children
    const menuData = [];

    for (const category of mainCategories) {
      const children = await Category.find({
        parentId: category._id,
        isActive: true,
      }).sort({ sortOrder: 1 });

      menuData.push({
        _id: category._id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        children: children.map((child) => ({
          _id: child._id,
          name: child.name,
          slug: child.slug,
          image: child.image,
        })),
      });
    }

    return res.success(menuData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true });

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    // Get parent category if exists
    let parent = null;
    if (category.parentId) {
      parent = await Category.findById(category.parentId).select("name slug");
    }

    // Get subcategories
    const children = await Category.find({
      parentId: category._id,
      isActive: true,
    }).sort({ sortOrder: 1 });

    return res.success({
      ...category.toObject(),
      parent,
      children,
    });
  } catch (error) {
    next(error);
  }
};
