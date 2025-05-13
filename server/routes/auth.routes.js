import express from "express";
import passport from "passport";
import {
  register,
  login,
  socialAuthCallback,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/auth.controller.js";
import {
  authMiddleware,
  registerValidator,
  loginValidator,
  passwordResetValidator,
  passwordUpdateValidator,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
// ============================================================

// Register a new user
router.post("/register", registerValidator, register);

// Login user
router.post("/login", loginValidator, login);

// Forgot password
router.post("/forgot-password", passwordResetValidator, forgotPassword);

// Reset password with token
router.post("/reset-password/:token", resetPassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  socialAuthCallback
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  socialAuthCallback
);

// Protected routes (require authentication)
// ============================================================

// Update password (when logged in)
router.post(
  "/update-password",
  authMiddleware,
  passwordUpdateValidator,
  updatePassword
);

export default router;
