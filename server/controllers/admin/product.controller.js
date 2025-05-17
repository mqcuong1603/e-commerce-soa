import Product from "../../models/product.model.js";
import ProductVariant from "../../models/productVariant.model.js";
import ProductImage from "../../models/productImage.model.js";
import Category from "../../models/category.model.js";
import Order from "../../models/order.model.js";
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
    } // Filter by status - properly map "active"/"inactive" to boolean
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }
    // Don't filter if status is blank, null, "all", or any other value

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
      .populate("images")
      .populate("variants");

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // If variants are not populated via virtual, fetch them directly
    if (!product.variants || product.variants.length === 0) {
      const variants = await ProductVariant.find({ productId: product._id });
      product.variants = variants;
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

    return res.success(product, 201);
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
    const {
      name,
      description,
      shortDescription,
      brand,
      basePrice,
      salePrice,
      categories,
      tags,
      sku,
      inventory,
      isActive,
      isNewProduct,
      isBestSeller,
      isFeatured,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (shortDescription !== undefined)
      product.shortDescription = shortDescription;
    if (brand) product.brand = brand;
    if (basePrice !== undefined) product.basePrice = basePrice;
    if (salePrice !== undefined) product.salePrice = salePrice;
    if (categories && categories.length > 0) product.categories = categories;
    if (tags !== undefined) product.tags = tags;
    if (sku) product.sku = sku;
    if (inventory !== undefined) product.inventory = inventory;
    if (isActive !== undefined) product.isActive = isActive;
    if (isNewProduct !== undefined) product.isNewProduct = isNewProduct;
    if (isBestSeller !== undefined) product.isBestSeller = isBestSeller;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    await product.save();

    return res.success(product);
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

    if (isActive === undefined) {
      throw new ApiError("Status field is required", 400);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      { new: true }
    );

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return res.success(product);
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

    // Delete product images first
    const images = await ProductImage.find({ productId });
    for (const image of images) {
      // Delete image file from storage
      const imagePath = path.join(
        process.cwd(),
        "uploads/products",
        path.basename(image.imageUrl)
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await image.deleteOne();
    }

    // Delete associated variants
    await ProductVariant.deleteMany({ productId });

    await product.deleteOne();

    return res.success({ message: "Product deleted successfully" });
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
      throw new ApiError("No image file provided", 400);
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

    // Create image record
    const image = new ProductImage({
      productId,
      variantId: variantId || null,
      imageUrl: `/uploads/products/${req.file.filename}`,
      alt: req.body.alt || product.name,
      isMain: isMain === "true",
    });

    await image.save();

    // If this is set as main image, update other images of the same context
    if (image.isMain) {
      await ProductImage.updateMany(
        {
          productId,
          variantId: variantId || null,
          _id: { $ne: image._id },
        },
        { isMain: false }
      );
    }

    return res.success(image, 201);
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

    const image = await ProductImage.findOne({ _id: imageId, productId });

    if (!image) {
      throw new ApiError("Image not found", 404);
    }

    // Delete image file from storage
    const imagePath = path.join(
      process.cwd(),
      "uploads/products",
      path.basename(image.imageUrl)
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await image.deleteOne();

    // If this was a main image, set another image as main if available
    if (image.isMain) {
      const nextImage = await ProductImage.findOne({
        productId,
        variantId: image.variantId,
      });
      if (nextImage) {
        nextImage.isMain = true;
        await nextImage.save();
      }
    }

    return res.success({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product image
 */
export const updateProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    const { alt, isMain, variantId } = req.body;

    const image = await ProductImage.findOne({ _id: imageId, productId });

    if (!image) {
      throw new ApiError("Image not found", 404);
    }

    // Update image fields
    if (alt !== undefined) image.alt = alt;
    if (variantId !== undefined) image.variantId = variantId || null;
    if (isMain !== undefined) {
      image.isMain = isMain;

      // If setting as main image, update other images of same context
      if (isMain) {
        await ProductImage.updateMany(
          {
            productId,
            variantId: image.variantId,
            _id: { $ne: image._id },
          },
          { isMain: false }
        );
      }
    }

    await image.save();

    return res.success(image);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product statistics
 */
export const getBestSellingProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Find the best selling products by analyzing order items
    const variantSales = await Order.aggregate([
      // Only consider completed orders
      { $match: { status: "completed" } },
      // Unwind to work with individual items
      { $unwind: "$items" },
      // Group by product variant to calculate total units sold
      {
        $group: {
          _id: "$items.productVariantId",
          totalQuantity: { $sum: "$items.quantity" },
          productName: { $first: "$items.productName" },
          variantName: { $first: "$items.variantName" },
          price: { $first: "$items.price" },
        },
      },
      // Sort by total quantity sold, descending
      { $sort: { totalQuantity: -1 } },
      // Limit to the requested number of products
      { $limit: limit },
      // Project to match the expected format
      {
        $project: {
          _id: 0,
          productName: 1,
          variantName: 1,
          price: 1,
          totalQuantity: 1,
        },
      },
    ]);
    return res.success(variantSales);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product variants
 */
export const getProductVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Get all variants for this product
    const variants = await ProductVariant.find({ productId });

    return res.success(variants);
  } catch (error) {
    next(error);
  }
};

/**
 * Create product variant
 */
export const createProductVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, sku, price, salePrice, inventory, attributes, isActive } =
      req.body;

    // Validate required fields
    if (!name || !sku || price === undefined) {
      throw new ApiError("Missing required variant fields", 400);
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Check if SKU is unique
    const existingVariant = await ProductVariant.findOne({ sku });
    if (existingVariant) {
      throw new ApiError("SKU must be unique", 400);
    }

    // Create variant
    const variant = new ProductVariant({
      productId,
      name,
      sku,
      price,
      salePrice: salePrice || null,
      inventory: inventory || 0,
      attributes: attributes || {},
      isActive: isActive !== undefined ? isActive : true,
    });

    await variant.save();

    return res.success(variant, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product variant
 */
export const updateProductVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const { name, sku, price, salePrice, inventory, attributes, isActive } =
      req.body;

    // Find the variant
    const variant = await ProductVariant.findOne({
      _id: variantId,
      productId,
    });

    if (!variant) {
      throw new ApiError("Variant not found", 404);
    }

    // Check if SKU already exists (for another variant)
    if (sku && sku !== variant.sku) {
      const existingVariant = await ProductVariant.findOne({
        sku,
        _id: { $ne: variantId },
      });

      if (existingVariant) {
        throw new ApiError("SKU must be unique", 400);
      }
    }

    // Update fields
    if (name) variant.name = name;
    if (sku) variant.sku = sku;
    if (price !== undefined) variant.price = price;
    if (salePrice !== undefined) variant.salePrice = salePrice;
    if (inventory !== undefined) variant.inventory = inventory;
    if (attributes) variant.attributes = attributes;
    if (isActive !== undefined) variant.isActive = isActive;

    await variant.save();

    return res.success(variant);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product variant
 */
export const deleteProductVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    // Find the variant
    const variant = await ProductVariant.findOne({
      _id: variantId,
      productId,
    });

    if (!variant) {
      throw new ApiError("Variant not found", 404);
    }

    // Delete variant-specific images
    const images = await ProductImage.find({ variantId });
    for (const image of images) {
      // Delete image file from storage if not used by other variants
      const imagePath = path.join(
        process.cwd(),
        "uploads/products",
        path.basename(image.imageUrl)
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await image.deleteOne();
    }

    await variant.deleteOne();

    // Check if this was the last variant and update product hasVariants flag if needed
    const remainingVariants = await ProductVariant.countDocuments({
      productId,
    });

    return res.success({
      message: "Variant deleted successfully",
      remainingVariants,
    });
  } catch (error) {
    next(error);
  }
};
