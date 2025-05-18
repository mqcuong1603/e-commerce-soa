// Fixed version of multer middleware
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage locations
const serverUploadsDir = path.join(__dirname, "uploads/products");
const clientUploadsDir = path.join(__dirname, "client/public/images/products");

// Ensure uploads directories exist
if (!fs.existsSync(serverUploadsDir)) {
  fs.mkdirSync(serverUploadsDir, { recursive: true });
}

if (fs.existsSync(path.join(__dirname, "client"))) {
  if (!fs.existsSync(clientUploadsDir)) {
    fs.mkdirSync(clientUploadsDir, { recursive: true });
  }
}

// Create a simple middleware function without using diskStorage
const uploadMiddleware = (req, res, next) => {
  // Use memory storage by default
  const upload = multer({
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error during file upload process",
      });
    }

    console.log("Request headers content-type:", req.headers["content-type"]);
    console.log("Request body keys:", Object.keys(req.body));

    // Check if file was uploaded
    if (!req.file) {
      console.log("No file found in request. Request body:", req.body);
      return res.status(400).json({
        success: false,
        message:
          "No image file provided. Please upload a file with the field name 'image'.",
      });
    }

    // Log file information for debugging
    console.log("File received:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? "Buffer present" : "No buffer",
    });

    try {
      // Validate file type
      const allowedTypes = /jpeg|jpg|png|gif|webp/;

      // Check if originalname exists before accessing it
      if (!req.file.originalname) {
        let extension = "jpg";
        if (req.file.mimetype) {
          const parts = req.file.mimetype.split("/");
          extension = parts.length > 1 ? parts[1] : "jpg";
        }
        req.file.originalname = `upload-${Date.now()}.${extension}`;
        console.log("Generated filename:", req.file.originalname);
      }

      const extension = path.extname(req.file.originalname).toLowerCase();
      if (
        !req.file.mimetype ||
        !extension.match(allowedTypes) ||
        !req.file.mimetype.match(allowedTypes)
      ) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed (jpg, jpeg, png, gif, webp)",
        });
      }

      // Generate unique filename
      const uniqueSuffix =
        Date.now() + "-" + crypto.randomBytes(6).toString("hex");
      const filename = `product-${uniqueSuffix}${extension}`;

      // Save files directly - don't use diskStorage API
      const clientPath = path.join(clientUploadsDir, filename);
      const serverPath = path.join(serverUploadsDir, filename);

      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "File data is missing or corrupted",
        });
      }

      // Save to client directory (primary location)
      await fs.promises.writeFile(clientPath, req.file.buffer);
      console.log("File saved to client directory:", clientPath);

      // Also save to server directory as backup
      await fs.promises.writeFile(serverPath, req.file.buffer);
      console.log("File also saved to server directory:", serverPath);

      // Add file info to request
      req.file.filename = filename;
      req.file.path = clientPath;
      req.file.imageUrl = `/images/products/${filename}`;

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
