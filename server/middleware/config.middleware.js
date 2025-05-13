import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import passport from "passport";
import { responseMiddleware } from "./response.middleware.js";

/**
 * Configures and applies all middleware to the Express app
 * @param {Express} app - Express app instance
 * @param {Object} config - Configuration object
 * @param {Object} logger - Logger instance
 */
export const configureMiddleware = (app, config, logger) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // Rate limiting middleware
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  });
  app.use("/api/", apiLimiter);

  // CORS middleware
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API response formatter middleware
  app.use(responseMiddleware);

  // Session configuration with enhanced security
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: config.nodeEnv === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: config.nodeEnv === "production" ? "strict" : "lax",
      },
    })
  );

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  logger.info("All middleware configured successfully");
};

/**
 * Configures error handling middleware
 * @param {Express} app - Express app instance
 * @param {Function} errorHandler - Error handler middleware
 */
export const configureErrorHandlers = (app, errorHandler) => {
  // Error handling middleware
  app.use(errorHandler);

  // Handle 404
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
};
