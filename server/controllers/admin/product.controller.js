import Product from "../../models/product.model.js";
import ProductVariant from "../../models/productVariant.model.js";
import ProductImage from "../../models/productImage.model.js";
import Category from "../../models/category.model.js";
import { ApiError } from "../../middleware/response.middleware.js";
import fs from "fs";
import path from "path";

/**
 * Get products with filtering, pagination and sorting
 */
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || null;
    const status = req.query.status || null;

    // Build query
    const query = {};

    // Search implementation
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null },
      ];
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by status - properly map "active"/"inactive" to boolean
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Fetch products with populated data
    const products = await Product.find(query)
      .populate("categories")
      .populate({
        path: "images",
        match: { isMain: true },
        options: { limit: 1 },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format product data for the UI
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      basePrice: product.basePrice,
      categories: product.categories,
      isActive: product.isActive,
      mainImage:
        product.images && product.images.length > 0 ? product.images[0] : null,
    }));

    return res.success({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("categories", "name")
      .populate("images");

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return res.success(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      brand,
      basePrice,
      salePrice,
      categories,
      sku,
      status,
      inventory,
      isNewProduct,
      isBestSeller,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !basePrice ||
      !categories ||
      categories.length === 0
    ) {
      throw new ApiError("Missing required fields", 400);
    }

    // Create product
    const product = new Product({
      name,
      description,
      shortDescription: shortDescription || "",
      brand,
      basePrice,
      salePrice: salePrice || null,
      categories,
      sku: sku || `SKU-${Date.now()}`,
      status: status || "active",
      inventory: inventory || 0,
      isNewProduct: isNewProduct || false,
      isBestSeller: isBestSeller || false,
      isFeatured: isFeatured || false,
    });

    await product.save();

    return res.success(product, "Product created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Update allowed fields
    const allowedFields = [
      "name",
      "description",
      "shortDescription",
      "brand",
      "basePrice",
      "salePrice",
      "categories",
      "sku",
      "status",
      "inventory",
      "isNewProduct",
      "isBestSeller",
      "isFeatured",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        product[field] = updateData[field];
      }
    });

    await product.save();

    return res.success(product, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Delete associated images
    const images = await ProductImage.find({ productId });
    for (const image of images) {
      // Delete image file if it exists
      try {
        const imagePath = path.join(process.cwd(), "uploads", image.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting image file:", err);
      }

      await image.deleteOne();
    }

    // Delete associated variants
    await ProductVariant.deleteMany({ productId });

    // Delete the product
    await product.deleteOne();

    return res.success({ productId }, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update product status
 */
export const updateProductStatus = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    // Validate that isActive is a boolean
    if (typeof isActive !== "boolean") {
      return res.error("Status value must be boolean", 400);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.error("Product not found", 404);
    }

    return res.success({
      product: { _id: product._id, isActive: product.isActive },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload product image
 */
export const uploadProductImage = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { isMain, variantId } = req.body;

    if (!req.file) {
      throw new ApiError("No image file uploaded", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Check if variant exists if variantId is provided
    if (variantId) {
      const variant = await ProductVariant.findOne({
        _id: variantId,
        productId,
      });

      if (!variant) {
        throw new ApiError("Variant not found", 404);
      }
    }

    // If this is set as main image, unset any existing main image
    if (isMain === "true") {
      await ProductImage.updateMany(
        { productId, isMain: true },
        { isMain: false }
      );
    }

    // Create image record
    const image = new ProductImage({
      productId,
      variantId: variantId || null,
      filename: req.file.filename,
      imageUrl: `/uploads/${req.file.filename}`,
      isMain: isMain === "true",
      alt: product.name,
    });

    await image.save();

    return res.success(image, "Image uploaded successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product image
 */
export const deleteProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOne({
      _id: imageId,
      productId,
    });

    if (!image) {
      throw new ApiError("Image not found", 404);
    }

    // Delete image file if it exists
    try {
      const imagePath = path.join(process.cwd(), "uploads", image.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error("Error deleting image file:", err);
    }

    await image.deleteOne();

    return res.success({ imageId }, "Image deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get best selling products
 */
export const getBestSellingProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Aggregate to find best selling products
    const products = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "productId",
          as: "orderItems",
        },
      },
      {
        $addFields: {
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          basePrice: 1,
          salePrice: 1,
          totalSold: 1,
        },
      },
    ]);

    return res.success(products);
  } catch (error) {
    next(error);
  }
};
