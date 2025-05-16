/**
 * Central configuration file for application settings
 * Consolidates environment variables and default configurations
 */

export const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",

  // Server
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:8080",
  staticPath: process.env.STATIC_PATH || "public",

  // Authentication
  jwtSecret: process.env.JWT_SECRET || "your-jwt-secret-key",
  jwtExpire: process.env.JWT_EXPIRE || "7d",

  // Session
  sessionSecret: process.env.SESSION_SECRET || "your-session-secret-key",

  // Database
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",

  // Email
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: parseInt(process.env.EMAIL_PORT) || 587,
  emailSecure: process.env.EMAIL_SECURE === "true" || false,
  emailUser: process.env.EMAIL_USER || "your.email@gmail.com",
  emailPass: process.env.EMAIL_PASS || "your_app_password",

  // Loyalty points
  loyaltyPointValue: 1000, // 1 point = 1,000 VND
  loyaltyPointsEarnRate: 0.1, // 10% of total order value
};

export default config;
