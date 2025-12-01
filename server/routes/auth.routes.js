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
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("=== Google OAuth Error Details ===");
        console.error("Error message:", err.message);
        console.error("Error name:", err.name);
        console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        if (err.oauthError) {
          console.error("OAuth Error statusCode:", err.oauthError.statusCode);
          console.error("OAuth Error data:", err.oauthError.data);
        }
        console.error("=================================");

        let errorDetails = null;
        try {
          if (err.oauthError && err.oauthError.data) {
            errorDetails = JSON.parse(err.oauthError.data);
          }
        } catch (parseError) {
          errorDetails = err.oauthError ? err.oauthError.data : null;
        }

        return res.status(500).json({
          success: false,
          message: "Failed to obtain access token",
          error: err.message || "OAuth authentication failed",
          details: errorDetails,
          statusCode: err.oauthError ? err.oauthError.statusCode : null,
        });
      }
      if (!user) {
        console.error("Google OAuth - No user returned:", info);
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
          info,
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  socialAuthCallback
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Facebook OAuth Error:", err);
        let errorDetails = null;
        try {
          if (err.oauthError && err.oauthError.data) {
            errorDetails = JSON.parse(err.oauthError.data);
          }
        } catch (parseError) {
          errorDetails = err.oauthError ? err.oauthError.data : null;
        }
        return res.status(500).json({
          success: false,
          message: "Failed to obtain access token",
          error: err.message || "OAuth authentication failed",
          details: errorDetails,
        });
      }
      if (!user) {
        console.error("Facebook OAuth - No user returned:", info);
        return res.status(401).json({
          success: false,
          message: "Authentication failed",
          info,
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
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
