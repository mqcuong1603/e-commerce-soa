import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

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

// Import middleware
import {
  responseMiddleware,
  errorHandler,
} from "./middleware/response.middleware.js";
import {
  authMiddleware,
  adminMiddleware,
} from "./middleware/auth.middleware.js";

// Import passport configuration
import "./config/passport.config.js";

// Import database seeding function
import seedDatabaseFromJson from "./utils/seedFromJson.js";

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configure middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(responseMiddleware);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false, // Changed to false for better security
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Important for cross-site cookies in production
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

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

// Error handling middleware (should be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

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
