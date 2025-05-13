import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { ApiError } from "../middleware/response.middleware.js";

/**
 * Get products for landing page including new products, best sellers, and category products
 */
export const getLandingPageProducts = async (req, res, next) => {
  try {
    // Get new products (limited to 8)
    const newProducts = await Product.find({
      isNewProduct: true,
      isActive: true,
    })
      .populate({
        path: "variants",
        match: { isActive: true },
        options: { limit: 1 },
      })
      .populate({
        path: "images",
        match: { isMain: true },
        options: { limit: 1 },
      })
      .sort({ createdAt: -1 })
      .limit(8);

    // Get best seller products (limited to 8)
    const bestSellers = await Product.find({
      isBestSeller: true,
      isActive: true,
    })
      .populate({
        path: "variants",
        match: { isActive: true },
        options: { limit: 1 },
      })
      .populate({
        path: "images",
        match: { isMain: true },
        options: { limit: 1 },
      })
      .limit(8);

    // Get main categories (top level)
    const categories = await Category.find({
      isActive: true,
      parentId: null,
    })
      .sort({ sortOrder: 1 })
      .limit(6);

    // Get products for each category (up to 4 per category)
    const categoryProducts = {};

    for (const category of categories) {
      const products = await Product.find({
        categories: category._id,
        isActive: true,
      })
        .populate({
          path: "variants",
          match: { isActive: true },
          options: { limit: 1 },
        })
        .populate({
          path: "images",
          match: { isMain: true },
          options: { limit: 1 },
        })
        .limit(4);

      categoryProducts[category._id] = {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
        },
        products,
      };
    }

    // Combine all data for the landing page
    const landingPageData = {
      newProducts,
      bestSellers,
      categoryProducts,
    };

    return res.success(landingPageData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products with pagination and filtering
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt"; // Default sort by newest

    const categoryId = req.query.category;
    const search = req.query.search;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    const brand = req.query.brand;

    // Build query
    let query = { isActive: true };

    // Apply filters if present
    if (categoryId) {
      query.categories = categoryId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (brand) {
      query.brand = brand;
    }

    // Get base prices from variants
    const basePriceQuery = {};
    if (minPrice || maxPrice) {
      basePriceQuery.basePrice = {
        $gte: minPrice,
        $lte: maxPrice,
      };
      query = { ...query, ...basePriceQuery };
    }

    // Count total matching products
    const total = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .populate({
        path: "variants",
        match: { isActive: true },
        options: { limit: 1 },
      })
      .populate({
        path: "images",
        match: { isMain: true },
        options: { limit: 1 },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate({
        path: "variants",
        match: { isActive: true },
      })
      .populate({
        path: "images",
      })
      .populate({
        path: "categories",
        select: "name slug",
      })
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 }, limit: 10 },
      });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return res.success(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "-createdAt";

    // Find category by slug
    const category = await Category.findOne({ slug });

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    // Find all child categories (if any)
    const childCategories = await Category.find({ parentId: category._id });

    // Create array of category IDs including the parent and children
    const categoryIds = [category._id, ...childCategories.map((c) => c._id)];

    // Query products in this category and all its children
    const query = {
      categories: { $in: categoryIds },
      isActive: true,
    };

    // Count total products in category
    const total = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .populate({
        path: "variants",
        match: { isActive: true },
        options: { limit: 1 },
      })
      .populate({
        path: "images",
        match: { isMain: true },
        options: { limit: 1 },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.success({
      category,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};
