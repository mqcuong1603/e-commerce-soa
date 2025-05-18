// Fixed version of multer middleware (V2)
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage locations using process.cwd() for consistency
const serverUploadsDir = path.join(process.cwd(), "server/uploads/products");
const clientUploadsDir = path.join(
  process.cwd(),
  "client/public/images/products"
);

// Ensure uploads directories exist
console.log("Server uploads directory:", serverUploadsDir);
console.log("Client uploads directory:", clientUploadsDir);

if (!fs.existsSync(serverUploadsDir)) {
  console.log("Creating server uploads directory");
  fs.mkdirSync(serverUploadsDir, { recursive: true });
}

if (!fs.existsSync(clientUploadsDir)) {
  console.log("Creating client uploads directory");
  fs.mkdirSync(clientUploadsDir, { recursive: true });
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

      try {
        // Ensure directories exist before writing files
        const clientDir = path.dirname(clientPath);
        const serverDir = path.dirname(serverPath);

        if (!fs.existsSync(clientDir)) {
          fs.mkdirSync(clientDir, { recursive: true });
          console.log("Created client directory:", clientDir);
        }

        if (!fs.existsSync(serverDir)) {
          fs.mkdirSync(serverDir, { recursive: true });
          console.log("Created server directory:", serverDir);
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
      } catch (writeError) {
        console.error("Error writing file to disk:", writeError);
        return res.status(500).json({
          success: false,
          message: "Error saving uploaded file to disk",
        });
      }
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
