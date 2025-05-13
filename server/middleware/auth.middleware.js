// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/user.model.js";
import { ApiError } from "./response.middleware.js";

// Validation middleware
export const registerValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("fullName").notEmpty().withMessage("Full name is required").trim(),

  // Address validation
  body("address.fullName").optional().trim(),
  body("address.phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .trim(),
  body("address.addressLine1")
    .notEmpty()
    .withMessage("Address line 1 is required")
    .trim(),
  body("address.addressLine2").optional().trim(),
  body("address.city").notEmpty().withMessage("City is required").trim(),
  body("address.state").notEmpty().withMessage("State is required").trim(),
  body("address.postalCode")
    .notEmpty()
    .withMessage("Postal code is required")
    .trim(),
  body("address.country").notEmpty().withMessage("Country is required").trim(),

  // Validate results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error("Validation failed", 400, errors.array());
    }
    next();
  },
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error("Validation failed", 400, errors.array());
    }
    next();
  },
];

export const passwordResetValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error("Validation failed", 400, errors.array());
    }
    next();
  },
];

export const passwordUpdateValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error("Validation failed", 400, errors.array());
    }
    next();
  },
];

/**
 * Authentication middleware for protected routes
 * Requires valid JWT token in Authorization header
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = req.headers.authorization;

    // Check if token exists
    if (!token || !token.startsWith("Bearer ")) {
      throw new ApiError("Unauthorized - No token provided", 401);
    }

    // Remove "Bearer " from token
    token = token.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select(
      "-passwordHash -passwordSalt"
    );

    if (!user) {
      throw new ApiError("Unauthorized - User not found", 401);
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new ApiError("Account is inactive or banned", 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Unauthorized - Invalid token", 401));
    }

    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Unauthorized - Token expired", 401));
    }

    next(error);
  }
};

/**
 * Admin middleware - requires user to have admin role
 * Must be used after authMiddleware
 */
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new ApiError("Unauthorized - Admin access required", 403));
  }
};

/**
 * Optional auth middleware
 * Doesn't require auth but adds user to req if logged in
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = req.headers.authorization;

    // If no token or invalid format, continue without user
    if (!token || !token.startsWith("Bearer ")) {
      return next();
    }

    // Remove "Bearer " from token
    token = token.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select(
        "-passwordHash -passwordSalt"
      );

      if (user && user.status === "active") {
        // Add user to request object
        req.user = user;
      }
    } catch (err) {
      // Continue without user if token validation fails
    }

    next();
  } catch (error) {
    next();
  }
};
