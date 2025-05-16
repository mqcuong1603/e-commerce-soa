import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import ProductVariant from "../models/productVariant.model.js";
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
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    let sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Build query with all filters
    const query = { isActive: true };

    // Apply category filter if present
    if (req.query.category) {
      query.categories = req.query.category;
    }

    // Apply search filter if present
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { brand: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Apply brand filter if present - make it case insensitive
    if (req.query.brand) {
      query.brand = new RegExp("^" + req.query.brand + "$", "i");
    }

    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice
      ? parseFloat(req.query.maxPrice)
      : Number.MAX_SAFE_INTEGER;

    let products = [];
    let total = 0;

    // Different handling for price filtering
    if (req.query.minPrice || req.query.maxPrice) {
      // Use a lookup-based aggregation to find products with matching prices
      // This will consider both product prices and variant prices
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: "productvariants",
            let: { productId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$productId", "$$productId"] },
                  isActive: true,
                },
              },
            ],
            as: "allVariants",
          },
        },
        {
          $addFields: {
            // Calculate effective price for proper price sorting
            effectivePrice: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$salePrice", null] },
                    { $gt: ["$salePrice", 0] },
                  ],
                },
                "$salePrice",
                "$basePrice",
              ],
            },
            // Check if any variant price matches the criteria
            hasMatchingVariant: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$allVariants",
                      as: "variant",
                      cond: {
                        $and: [
                          {
                            $gte: [
                              {
                                $cond: [
                                  {
                                    $and: [
                                      { $ne: ["$$variant.salePrice", null] },
                                      { $gt: ["$$variant.salePrice", 0] },
                                    ],
                                  },
                                  "$$variant.salePrice",
                                  "$$variant.price",
                                ],
                              },
                              minPrice,
                            ],
                          },
                          {
                            $lte: [
                              {
                                $cond: [
                                  {
                                    $and: [
                                      { $ne: ["$$variant.salePrice", null] },
                                      { $gt: ["$$variant.salePrice", 0] },
                                    ],
                                  },
                                  "$$variant.salePrice",
                                  "$$variant.price",
                                ],
                              },
                              maxPrice,
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $match: {
            $or: [
              { productPrice: { $gte: minPrice, $lte: maxPrice } },
              { hasMatchingVariant: true },
            ],
          },
        },
        // Apply proper sorting using effectivePrice for price sorting
        {
          $sort:
            sortField === "price" ? { effectivePrice: sortOrder } : sortOptions,
        },
        { $skip: skip },
        { $limit: limit },
      ];

      products = await Product.aggregate(pipeline);

      // Populate necessary fields
      products = await Product.populate(products, {
        path: "variants",
        match: { isActive: true },
      });

      products = await Product.populate(products, {
        path: "images",
        match: { isMain: true },
        options: { limit: 1 },
      });

      // Count total for pagination
      const countPipeline = pipeline.slice(0, -3); // Remove sort, skip, limit
      countPipeline.push({ $count: "total" });

      const countResult = await Product.aggregate(countPipeline);
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // For non-price filtering, use the standard approach
      total = await Product.countDocuments(query);

      // Apply sorting conditionally based on sortField
      if (sortField === "price") {
        // Use aggregation for price sorting
        products = await Product.aggregate([
          { $match: query },
          {
            $addFields: {
              effectivePrice: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$salePrice", null] },
                      { $gt: ["$salePrice", 0] },
                    ],
                  },
                  "$salePrice",
                  "$basePrice",
                ],
              },
            },
          },
          { $sort: { effectivePrice: sortOrder } },
          { $skip: skip },
          { $limit: limit },
        ]);

        // Populate necessary fields after aggregation
        products = await Product.populate(products, {
          path: "variants",
          match: { isActive: true },
        });

        products = await Product.populate(products, {
          path: "images",
          match: { isMain: true },
          options: { limit: 1 },
        });
      } else {
        // Regular sorting for non-price fields
        products = await Product.find(query)
          .populate({
            path: "variants",
            match: { isActive: true },
          })
          .populate({
            path: "images",
            match: { isMain: true },
            options: { limit: 1 },
          })
          .sort(sortOptions)
          .skip(skip)
          .limit(limit);
      }
    }

    // Add variant count to each product
    for (const product of products) {
      // Count total variants for this product
      const variantCount = await ProductVariant.countDocuments({
        productId: product._id,
        isActive: true,
      });

      // Handle both mongoose documents and aggregation results
      if (product._doc) {
        product._doc.variantCount = variantCount;
      } else {
        // For aggregation results
        product.variantCount = variantCount;
      }
    }

    // Return the response with pagination info
    return res.success(
      {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      "Products retrieved successfully"
    );
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
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    // Changed from const to let
    let sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Initialize products variable
    let products = [];

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

    // Custom sorting logic for prices to handle both regular and sale prices
    if (sortField === "price") {
      if (sortOrder === 1) {
        // ascending
        products = await Product.aggregate([
          { $match: query },
          {
            $addFields: {
              effectivePrice: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$salePrice", null] },
                      { $gt: ["$salePrice", 0] },
                    ],
                  },
                  "$salePrice",
                  "$basePrice",
                ],
              },
            },
          },
          { $sort: { effectivePrice: 1 } },
          { $skip: skip },
          { $limit: limit },
        ]);

        // Populate necessary fields
        await Product.populate(products, {
          path: "variants",
          match: { isActive: true },
        });

        await Product.populate(products, {
          path: "images",
          match: { isMain: true },
          options: { limit: 1 },
        });
      } else {
        // descending
        products = await Product.aggregate([
          { $match: query },
          {
            $addFields: {
              effectivePrice: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$salePrice", null] },
                      { $gt: ["$salePrice", 0] },
                    ],
                  },
                  "$salePrice",
                  "$basePrice",
                ],
              },
            },
          },
          { $sort: { effectivePrice: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);

        // Same population code as above
        await Product.populate(products, {
          path: "variants",
          match: { isActive: true },
        });

        await Product.populate(products, {
          path: "images",
          match: { isMain: true },
          options: { limit: 1 },
        });
      }
    } else {
      // For non-price sorting, use the standard approach
      sortOptions[sortField] = sortOrder;
      products = await Product.find(query)
        .populate({
          path: "variants",
          match: { isActive: true },
        })
        .populate({
          path: "images",
          match: { isMain: true },
          options: { limit: 1 },
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    }

    // Add variant count to each product
    for (const product of products) {
      // Count total variants for this product (without loading them all)
      const variantCount = await ProductVariant.countDocuments({
        productId: product._id,
        isActive: true,
      });

      // Handle both Mongoose documents and aggregation results
      if (product._doc) {
        product._doc.variantCount = variantCount;
      } else {
        // For aggregation results (from price sorting), add directly to product object
        product.variantCount = variantCount;
      }
    }

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
