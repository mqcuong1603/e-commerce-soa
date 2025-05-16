import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import route files
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import adminOrderRoutes from "./routes/admin/order.routes.js";

// Import middleware configuration
import {
  configureMiddleware,
  configureErrorHandlers,
} from "./middleware/config.middleware.js";

// Import error handler
import { errorHandler } from "./middleware/response.middleware.js";

// Import auth middleware
import {
  authMiddleware,
  adminMiddleware,
} from "./middleware/auth.middleware.js";

// Import passport configuration
import passport from "passport";
import "./config/passport.config.js";

// Import database seeding function
import seedDatabaseFromJson from "./utils/seedFromJson.js";

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8080";

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configure middleware using the centralized configuration
configureMiddleware(
  app,
  {
    sessionSecret: process.env.SESSION_SECRET || "your-secret-key",
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: CLIENT_URL || "http://localhost:8080",
    staticPath: path.join(__dirname, "public"),
  },
  console
); // Using console as logger

// Initialize passport
app.use(passport.initialize());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Seed database with initial data if needed
    // Only seed in development or if explicitly enabled
    // This allows you to control seeding in production
    if (
      process.env.NODE_ENV !== "production" ||
      process.env.SEED_DATABASE === "true"
    ) {
      try {
        await seedDatabaseFromJson();
      } catch (error) {
        console.error("Error seeding database:", error);
      }
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", authMiddleware, adminMiddleware, discountRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    message: "Server is running",
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Socket.io setup for real-time features
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle product reviews in real-time
  socket.on("new_review", (data) => {
    socket.broadcast.emit("review_update", data);
  });

  // Handle real-time cart updates
  socket.on("cart_update", (data) => {
    socket.broadcast.emit("cart_changed", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Configure error handlers
configureErrorHandlers(app, errorHandler);

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log(
    "SIGTERM signal received. Closing HTTP server and database connection."
  );
  httpServer.close(() => {
    console.log("HTTP server closed");
    mongoose.connection
      .close(false)
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      });
  });
});

// Also handle SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log(
    "SIGINT signal received. Closing HTTP server and database connection."
  );
  httpServer.close(() => {
    console.log("HTTP server closed");
    mongoose.connection
      .close(false)
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
