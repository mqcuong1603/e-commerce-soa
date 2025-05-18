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
      categories,
      isActive, // Added isActive to be directly set on product
      isNewProduct,
      isBestSeller,
      isFeatured,
      tags, // Added tags
      variants, // Expect an array of variant objects
      images, // Expect an array of image objects (e.g., { imageUrl, isMain, alt })
    } = req.body;

    // Validate required fields for the product
    if (
      !name ||
      !description ||
      !shortDescription ||
      !brand ||
      !basePrice ||
      !categories ||
      categories.length === 0
    ) {
      throw new ApiError(
        "Missing required product fields: name, description, shortDescription, brand, basePrice, categories",
        400
      );
    }

    // Create product
    const product = new Product({
      name,
      description,
      shortDescription,
      brand,
      basePrice,
      categories,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
      isNewProduct: isNewProduct || false,
      isBestSeller: isBestSeller || false,
      isFeatured: isFeatured || false,
      tags: tags || [],
    });

    await product.save();

    // Handle Product Variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const createdVariants = await Promise.all(
        variants.map(async (variantData) => {
          if (
            !variantData.sku ||
            !variantData.name ||
            !variantData.price ||
            variantData.inventory === undefined
          ) {
            // Optionally, decide if this should throw an error and rollback product creation
            // For now, we'll skip invalid variants or log a warning
            console.warn(
              "Skipping variant due to missing fields:",
              variantData
            );
            return null;
          }
          const newVariant = new ProductVariant({
            ...variantData,
            productId: product._id,
          });
          await newVariant.save();
          return newVariant;
        })
      );
      // Filter out any nulls if variants were skipped
      product.variants = createdVariants.filter((v) => v !== null);
    }

    // Handle Product Images
    if (images && Array.isArray(images) && images.length > 0) {
      const createdImages = await Promise.all(
        images.map(async (imageData) => {
          if (!imageData.imageUrl) {
            console.warn("Skipping image due to missing imageUrl:", imageData);
            return null;
          }
          const newImage = new ProductImage({
            ...imageData,
            productId: product._id,
            // variantId can be added if images are specific to variants and variantId is provided in imageData
          });
          await newImage.save();
          return newImage;
        })
      );
      product.images = createdImages.filter((img) => img !== null);
    }

    // Repopulate to send back the full product with variants and images
    const populatedProduct = await Product.findById(product._id)
      .populate("categories", "name")
      .populate("variants") // This virtual should now work if variants were created
      .populate("images"); // This virtual should now work if images were created

    return res.success(populatedProduct, 201);
  } catch (error) {
    // If product creation failed, and variants/images were partially created,
    // ideally, there should be a transaction/rollback mechanism.
    // For simplicity, we are not implementing that here.
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
      categories,
      tags,
      isActive,
      isNewProduct,
      isBestSeller,
      isFeatured,
      variants, // Array of variant objects
    } = req.body;

    const productToUpdate = await Product.findById(productId); // Renamed variable here
    if (!productToUpdate) {
      throw new ApiError("Product not found", 404);
    }

    // 1. Update core product fields
    productToUpdate.name = name || productToUpdate.name;
    productToUpdate.description = description || productToUpdate.description;
    productToUpdate.shortDescription =
      shortDescription !== undefined
        ? shortDescription
        : productToUpdate.shortDescription;
    productToUpdate.brand = brand || productToUpdate.brand;
    productToUpdate.basePrice =
      basePrice !== undefined
        ? parseFloat(basePrice)
        : productToUpdate.basePrice;
    productToUpdate.categories = categories || productToUpdate.categories;
    productToUpdate.tags = tags !== undefined ? tags : productToUpdate.tags;
    productToUpdate.isActive =
      isActive !== undefined ? isActive : productToUpdate.isActive;
    productToUpdate.isNewProduct =
      isNewProduct !== undefined ? isNewProduct : productToUpdate.isNewProduct;
    productToUpdate.isBestSeller =
      isBestSeller !== undefined ? isBestSeller : productToUpdate.isBestSeller;
    productToUpdate.isFeatured =
      isFeatured !== undefined ? isFeatured : productToUpdate.isFeatured;

    await productToUpdate.save();

    // 2. Handle Variants
    if (variants && Array.isArray(variants)) {
      const incomingVariantIds = variants.map((v) => v._id).filter((id) => id); // Get IDs of incoming variants that have an ID
      const existingDbVariants = await ProductVariant.find({ productId });

      // Variants to delete: in DB but not in incoming array (identified by _id)
      const variantsToDelete = existingDbVariants.filter(
        (ev) => !incomingVariantIds.includes(ev._id.toString())
      );

      for (const variantDoc of variantsToDelete) {
        // Before deleting variant, delete images associated ONLY with this variant
        // This assumes ProductImage has a variantId field.
        await ProductImage.deleteMany({ variantId: variantDoc._id });
        await variantDoc.deleteOne();
      }

      // Update existing or create new variants
      for (const variantData of variants) {
        if (variantData._id) {
          // Existing variant - try to update it
          const existingVariant = await ProductVariant.findOne({
            _id: variantData._id,
            productId,
          });

          if (existingVariant) {
            existingVariant.name = variantData.name || existingVariant.name;

            // SKU uniqueness check (only if SKU is changing)
            if (variantData.sku && variantData.sku !== existingVariant.sku) {
              const skuClash = await ProductVariant.findOne({
                sku: variantData.sku,
                _id: { $ne: existingVariant._id }, // Exclude self
              });
              if (skuClash) {
                console.warn(
                  `SKU '${variantData.sku}' already exists for another variant. Skipping SKU update for '${existingVariant.name}'.`
                );
              } else {
                existingVariant.sku = variantData.sku;
              }
            } else if (variantData.sku && !existingVariant.sku) {
              // If existing variant didn't have an SKU but one is provided now
              const skuClash = await ProductVariant.findOne({
                sku: variantData.sku,
              });
              if (skuClash) {
                console.warn(
                  `SKU '${variantData.sku}' already exists. Skipping SKU update for '${existingVariant.name}'.`
                );
              } else {
                existingVariant.sku = variantData.sku;
              }
            } else if (variantData.sku) {
              existingVariant.sku = variantData.sku; // Assign if no clash or not changing
            }

            existingVariant.price =
              variantData.price !== undefined
                ? parseFloat(variantData.price)
                : existingVariant.price;
            existingVariant.salePrice =
              variantData.salePrice !== undefined
                ? parseFloat(variantData.salePrice)
                : existingVariant.salePrice;
            existingVariant.inventory =
              variantData.inventory !== undefined
                ? parseInt(variantData.inventory)
                : existingVariant.inventory;
            existingVariant.attributes =
              variantData.attributes || existingVariant.attributes;
            existingVariant.isActive =
              variantData.isActive !== undefined
                ? variantData.isActive
                : existingVariant.isActive;

            try {
              await existingVariant.save();
            } catch (exVariantSaveError) {
              console.error(
                `Error saving existing variant ${existingVariant._id}:`,
                exVariantSaveError
              );
            }
          }
        } else {
          // New variant - create it
          if (
            variantData.sku &&
            variantData.name &&
            variantData.price !== undefined &&
            variantData.inventory !== undefined
          ) {
            const skuClash = await ProductVariant.findOne({
              sku: variantData.sku,
            });
            if (skuClash) {
              console.warn(
                `SKU '${variantData.sku}' already exists. Skipping creation of new variant '${variantData.name}'.`
              );
            } else {
              const newVariant = new ProductVariant({
                productId,
                name: variantData.name,
                sku: variantData.sku,
                price: parseFloat(variantData.price),
                salePrice: variantData.salePrice
                  ? parseFloat(variantData.salePrice)
                  : null,
                inventory: parseInt(variantData.inventory),
                attributes: variantData.attributes || {},
                isActive:
                  variantData.isActive !== undefined
                    ? variantData.isActive
                    : true,
              });
              try {
                await newVariant.save();
              } catch (newVariantSaveError) {
                console.error(
                  `Error saving new variant '${newVariant.name}':`,
                  newVariantSaveError
                );
              }
            }
          } else {
            console.warn(
              "Skipping new variant due to missing required fields (sku, name, price, inventory):",
              variantData
            );
          }
        }
      }
    } else if (
      variants === null ||
      (Array.isArray(variants) && variants.length === 0)
    ) {
      // If variants is explicitly null or an empty array, delete all existing variants for this product
      const existingDbVariants = await ProductVariant.find({ productId });
      for (const variantDoc of existingDbVariants) {
        await ProductImage.deleteMany({ variantId: variantDoc._id });
        await variantDoc.deleteOne();
      }
    }
    // If 'variants' is undefined in req.body, existing variants are untouched.

    const populatedProduct = await Product.findById(productId)
      .populate("categories", "name")
      .populate("variants")
      .populate("images");

    return res.success(populatedProduct);
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
    } // Delete product images first
    const images = await ProductImage.find({ productId });
    for (const image of images) {
      // Extract just the filename from the imageUrl (remove the leading path)
      const imageFilename = image.imageUrl.split("/").pop();

      // Create the correct paths for both client and server directories
      const clientImagePath = path.join(
        process.cwd(),
        "client/public/images/products",
        imageFilename
      );

      const serverImagePath = path.join(
        process.cwd(),
        "server/uploads/products",
        imageFilename
      );

      console.log(
        "Attempting to delete product image from client directory:",
        clientImagePath
      );

      // Delete from client public directory if it exists
      if (fs.existsSync(clientImagePath)) {
        fs.unlinkSync(clientImagePath);
        console.log(
          "Deleted product image successfully from client directory:",
          clientImagePath
        );
      } else {
        console.log("Client product image file not found at:", clientImagePath);
      }

      console.log(
        "Attempting to delete product image from server directory:",
        serverImagePath
      );

      // Delete from server directory if it exists (backup copy)
      if (fs.existsSync(serverImagePath)) {
        fs.unlinkSync(serverImagePath);
        console.log(
          "Deleted product image successfully from server directory:",
          serverImagePath
        );
      } else {
        console.log("Server product image file not found at:", serverImagePath);
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
    const { isMain, variantId, alt } = req.body; // alt might not be sent on initial upload, handle gracefully

    if (!req.file) {
      // This is where the "No image file provided" error originates.
      // It means the multer middleware did not attach a file to the request,
      // or it was cleared before reaching here.
      throw new ApiError("No image file provided", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      // If product doesn't exist, delete the uploaded file to prevent orphans
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw new ApiError("Product not found", 404);
    } // Enforce 3 product-level images max (variantId is null or undefined)
    if (
      variantId === null ||
      variantId === undefined ||
      variantId === "null" ||
      variantId === "undefined"
    ) {
      const existingProductImagesCount = await ProductImage.countDocuments({
        productId,
        variantId: null,
      });
      if (existingProductImagesCount >= 3) {
        // Delete the just-uploaded file as it exceeds the limit
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new ApiError(
          "Maximum of 3 product-level images already uploaded.",
          400
        );
      }
    }

    // Get imageUrl from middleware or construct it
    const imageUrl =
      req.file.imageUrl || `/images/products/${req.file.filename}`;

    const newImage = new ProductImage({
      productId,
      imageUrl,
      isMain: isMain === "true" || isMain === true, // Handle string "true" from FormData or boolean
      alt: alt || "Product image", // Provide a default alt text
      variantId:
        variantId === "null" || variantId === "undefined"
          ? null
          : variantId || null, // Ensure variantId is correctly null or the ID
    });

    // If this image is set as main, unset other main images for the same context (product or variant)
    if (newImage.isMain) {
      await ProductImage.updateMany(
        {
          productId,
          variantId: newImage.variantId,
          _id: { $ne: newImage._id },
        },
        { $set: { isMain: false } }
      );
    }

    await newImage.save();
    return res.success(newImage, 201);
  } catch (error) {
    // If an error occurs after file upload but before DB save, delete the orphaned file
    if (req.file) {
      console.error("Error in uploadProductImage:", error.message);

      // If we have a file, try to clean up any saved files
      if (req.file.filename) {
        // Extract just the filename
        const imageFilename = req.file.filename;

        // Create the correct paths for both client and server directories
        const clientImagePath = path.join(
          process.cwd(),
          "client/public/images/products",
          imageFilename
        );

        const serverImagePath = path.join(
          process.cwd(),
          "server/uploads/products",
          imageFilename
        );

        // Only try to delete if the error isn't about image limit or missing file
        if (
          error.message !==
            "Maximum of 3 product-level images already uploaded." &&
          error.message !== "No image file provided" &&
          error.message !== "Product not found"
        ) {
          // Try to delete from client public directory
          try {
            if (fs.existsSync(clientImagePath)) {
              fs.unlinkSync(clientImagePath);
              console.log(
                "Cleaned up orphaned file from client directory:",
                clientImagePath
              );
            }
          } catch (unlinkError) {
            console.error(
              "Error cleaning up orphaned file from client directory:",
              unlinkError
            );
          }

          // Try to delete from server directory
          try {
            if (fs.existsSync(serverImagePath)) {
              fs.unlinkSync(serverImagePath);
              console.log(
                "Cleaned up orphaned file from server directory:",
                serverImagePath
              );
            }
          } catch (unlinkError) {
            console.error(
              "Error cleaning up orphaned file from server directory:",
              unlinkError
            );
          }
        }
      }
    }
    next(error);
  }
};

/**
 * Delete product image
 */
export const deleteProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    // Ensure we are deleting a product-level image (variantId is null)
    const image = await ProductImage.findOne({
      _id: imageId,
      productId,
      variantId: null,
    });
    if (!image) {
      throw new ApiError("Image not found", 404);
    }

    // Extract just the filename from the imageUrl (remove the leading path)
    const imageFilename = image.imageUrl.split("/").pop();

    // Create the correct paths for both client and server directories
    const clientImagePath = path.join(
      process.cwd(),
      "client/public/images/products",
      imageFilename
    );

    const serverImagePath = path.join(
      process.cwd(),
      "server/uploads/products",
      imageFilename
    );

    console.log(
      "Attempting to delete image from client directory:",
      clientImagePath
    );

    // Delete from client public directory if it exists
    if (fs.existsSync(clientImagePath)) {
      fs.unlinkSync(clientImagePath);
      console.log("Deleted client image successfully:", clientImagePath);
    } else {
      console.log("Client image file not found at:", clientImagePath);
    }

    console.log(
      "Attempting to delete image from server directory:",
      serverImagePath
    );

    // Delete from server directory if it exists (backup copy)
    if (fs.existsSync(serverImagePath)) {
      fs.unlinkSync(serverImagePath);
      console.log("Deleted server image successfully:", serverImagePath);
    } else {
      console.log("Server image file not found at:", serverImagePath);
    }

    // Delete the image record from MongoDB
    await image.deleteOne();

    // If this was a main image, set another image as main if available
    if (image.isMain) {
      const nextImage = await ProductImage.findOne({
        productId,
        variantId: null, // Ensure next main is also a product-level image
      }).sort({ createdAt: 1 }); // Pick the oldest as next main, or based on a sortOrder if you add one
      if (nextImage) {
        nextImage.isMain = true;
        await nextImage.save();
      }
    }

    return res.success({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    next(error);
  }
};

/**
 * Update product image
 */
export const updateProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    // variantId is removed from req.body for product-level images
    const { alt, isMain } = req.body;

    // Ensure we are updating a product-level image
    const image = await ProductImage.findOne({
      _id: imageId,
      productId,
      variantId: null,
    });

    if (!image) {
      throw new ApiError("Image not found or it's a variant image.", 404);
    }

    // Update image fields
    if (alt !== undefined) image.alt = alt;
    // image.variantId = null; // It's already null and should remain null

    if (isMain !== undefined) {
      image.isMain = isMain === true || isMain === "true"; // Handle boolean or string 'true'

      // If setting as main image, update other product-level images
      if (image.isMain) {
        await ProductImage.updateMany(
          {
            productId,
            variantId: null, // Only affect product-level images
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
      // Lookup the latest status for each order
      {
        $lookup: {
          from: "orderstatuses", // Ensure this matches your collection name for OrderStatus
          localField: "_id",
          foreignField: "orderId",
          as: "statusHistory",
          pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
        },
      },
      {
        $addFields: {
          currentStatus: { $arrayElemAt: ["$statusHistory.status", 0] },
        },
      },
      // Consider orders with status confirmed, processing, shipping, or delivered
      {
        $match: {
          currentStatus: {
            $in: ["confirmed", "processing", "shipping", "delivered"],
          },
        },
      },
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
    } // Delete variant-specific images
    const images = await ProductImage.find({ variantId });
    for (const image of images) {
      // Extract just the filename from the imageUrl (remove the leading path)
      const imageFilename = image.imageUrl.split("/").pop();

      // Create the correct paths for both client and server directories
      const clientImagePath = path.join(
        process.cwd(),
        "client/public/images/products",
        imageFilename
      );

      const serverImagePath = path.join(
        process.cwd(),
        "server/uploads/products",
        imageFilename
      );

      console.log(
        "Attempting to delete variant image from client directory:",
        clientImagePath
      );

      // Delete from client public directory if it exists
      if (fs.existsSync(clientImagePath)) {
        fs.unlinkSync(clientImagePath);
        console.log(
          "Deleted variant image successfully from client directory:",
          clientImagePath
        );
      } else {
        console.log("Client variant image file not found at:", clientImagePath);
      }

      console.log(
        "Attempting to delete variant image from server directory:",
        serverImagePath
      );

      // Delete from server directory if it exists (backup copy)
      if (fs.existsSync(serverImagePath)) {
        fs.unlinkSync(serverImagePath);
        console.log(
          "Deleted variant image successfully from server directory:",
          serverImagePath
        );
      } else {
        console.log("Server variant image file not found at:", serverImagePath);
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
