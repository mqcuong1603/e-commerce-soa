import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage location
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a Multer 2.0 compatible middleware function
const uploadMiddleware = (req, res, next) => {
  // Create the upload handler
  const upload = multer();

  // Process single file upload
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading file",
      });
    }

    if (!req.file) {
      return next();
    }

    try {
      // Validate file type
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extension = path.extname(req.file.originalname).toLowerCase();
      const isValidType =
        allowedTypes.test(extension) && allowedTypes.test(req.file.mimetype);

      if (!isValidType) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed (jpg, jpeg, png, gif, webp)",
        });
      }

      // Check file size (5MB limit)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "File is too large. Maximum size is 5MB.",
        });
      }

      // Generate unique filename
      const uniqueSuffix =
        Date.now() + "-" + crypto.randomBytes(6).toString("hex");
      const filename = `product-${uniqueSuffix}${extension}`;
      const finalPath = path.join(uploadsDir, filename);

      // Save the file
      await fs.promises.writeFile(finalPath, req.file.buffer);

      // Add the file information to the request
      req.file.filename = filename;
      req.file.path = finalPath;
      req.file.destination = uploadsDir;

      next();
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing the uploaded file",
      });
    }
  });
};

export default uploadMiddleware;
