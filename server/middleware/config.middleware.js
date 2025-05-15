import session from "express-session";
import MongoStore from "connect-mongo";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { responseMiddleware } from "./response.middleware.js";
import cookieParser from "cookie-parser";

export const configureMiddleware = (app, config, logger) => {
  // 1. Start with security headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // 2. CORS must come BEFORE cookie handling
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 200,
    })
  );

  // 3. Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 4. Now cookie parsing (this was out of order in app.js)
  app.use(cookieParser());

  // 5. Then session handling
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: true,
      name: "ecommerce.sid",
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 30 * 24 * 60 * 60,
        crypto: {
          secret: config.sessionSecret,
        },
      }),
      cookie: {
        path: "/",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        domain: undefined,
      },
    })
  );

  // Rate limiting middleware
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  });
  app.use("/api/", apiLimiter);

  // Static files middleware
  if (config.staticPath) {
    app.use(express.static(config.staticPath));
  }

  // API response formatter middleware
  app.use(responseMiddleware);

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
