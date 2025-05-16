import express from "express";
import * as productController from "../../controllers/admin/product.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../middleware/auth.middleware.js";
import uploadMiddleware from "../../middleware/multer.middleware.js";

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// Get products with pagination and filtering
router.get("/", productController.getProducts);

// Get best selling products - MOVED UP before the /:productId route
router.get("/stats/best-selling", productController.getBestSellingProducts);

// Get a single product
router.get("/:productId", productController.getProductById);

// Create a new product
router.post("/", productController.createProduct);

// Update a product
router.put("/:productId", productController.updateProduct);

// Delete a product
router.delete("/:productId", productController.deleteProduct);

// Update product status
router.patch("/:productId/status", productController.updateProductStatus);

// Upload product image
router.post(
  "/:productId/images",
  uploadMiddleware,
  productController.uploadProductImage
);

// Delete product image
router.delete(
  "/:productId/images/:imageId",
  productController.deleteProductImage
);

export default router;
