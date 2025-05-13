// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import Cart from "../models/cart.model.js";
import { ApiError } from "../middleware/response.middleware.js";
import crypto from "crypto";
import emailService from "../services/emailService.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Register a new user with shipping address
 */
export const register = async (req, res, next) => {
  try {
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError("Request body is empty", 400);
    }

    const { email, fullName, address } = req.body;

    // Validate required fields
    if (!email || !fullName || !address) {
      throw new ApiError("Missing required fields", 400);
    }

    // Validate the email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError("Invalid email format", 400);
    }

    // Validate address fields
    if (
      !address.phoneNumber ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.postalCode ||
      !address.country
    ) {
      throw new ApiError("Missing required address fields", 400);
    }

    // Delegate user registration to email service
    const result = await emailService.registerUser({
      email,
      fullName,
      address,
    });

    // Return success response
    return res.success(
      {
        userId: result.userId,
        message: result.message,
      },
      "Registration successful"
    );
  } catch (error) {
    if (error.statusCode) {
      return res.error(error.message, error.statusCode);
    }

    // Handle specific validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.error("Validation failed", 400, errors);
    }

    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Check password
    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new ApiError("Your account is inactive or banned", 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Transfer session cart to user if exists
    if (req.session.id) {
      const sessionCart = await Cart.findOne({ sessionId: req.session.id });
      if (sessionCart) {
        await sessionCart.transferCart(user._id);
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data without sensitive info
    return res.success({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Social auth callback handler
 */
export const socialAuthCallback = async (req, res, next) => {
  try {
    // User will be attached by passport strategy
    const user = req.user;

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Transfer cart if one exists with the session ID
    if (req.session.id) {
      const sessionCart = await Cart.findOne({ sessionId: req.session.id });
      if (sessionCart) {
        await sessionCart.transferCart(user._id);
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // For API response, return the token
    if (req.get("Accept") === "application/json") {
      return res.success({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token,
      });
    }

    // For browser redirects, redirect with token in URL
    // The frontend can extract this token from URL and store in localStorage
    const frontendURL = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - send password reset email
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.success({
        message:
          "If a user with that email exists, a password reset link has been sent",
      });
    }

    // Generate reset token and save
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send email with reset link using our email service
    await emailService.sendPasswordResetEmail({
      email: user.email,
      resetToken,
      fullName: user.fullName,
    });

    return res.success({
      message:
        "If a user with that email exists, a password reset link has been sent",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate password strength
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError("Password must be at least 6 characters", 400);
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError("Invalid or expired reset token", 400);
    }

    // Update password and clear reset token
    user.passwordHash = newPassword; // Will be hashed in pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.success({ message: "Password has been reset successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Update password (when logged in)
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate password strength
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError("New password must be at least 6 characters", 400);
    }

    // Get user from database
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.verifyPassword(currentPassword);

    if (!isMatch) {
      throw new ApiError("Current password is incorrect", 400);
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed in pre-save hook
    await user.save();

    return res.success({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
