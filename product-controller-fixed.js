// Fixed error handling for uploadProductImage function
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
      if (req.file && req.file.filename) {
        // Extract filename and delete from both directories
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

        // Delete the files if they exist
        if (fs.existsSync(clientImagePath)) {
          fs.unlinkSync(clientImagePath);
        }

        if (fs.existsSync(serverImagePath)) {
          fs.unlinkSync(serverImagePath);
        }
      }
      throw new ApiError("Product not found", 404);
    }

    // Enforce 3 product-level images max (variantId is null or undefined)
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
        if (req.file && req.file.filename) {
          // Extract filename and delete from both directories
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

          // Delete the files if they exist
          if (fs.existsSync(clientImagePath)) {
            fs.unlinkSync(clientImagePath);
            console.log(
              "Deleted excess image from client directory:",
              clientImagePath
            );
          }

          if (fs.existsSync(serverImagePath)) {
            fs.unlinkSync(serverImagePath);
            console.log(
              "Deleted excess image from server directory:",
              serverImagePath
            );
          }
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
