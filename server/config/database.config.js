import mongoose from "mongoose";

/**
 * Configure and connect to MongoDB database
 *
 * @param {Object} config - Configuration object
 * @param {string} config.dbUri - MongoDB connection URI
 * @param {Object} logger - Logger instance
 * @returns {Promise} Promise resolving when database is connected and seeded
 */
export const connectDatabase = async (config, logger, seedFn, verifyFn) => {
  try {
    await mongoose.connect(config.dbUri, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 30000,
    });

    logger.info("MongoDB connected successfully");

    // Seed database with initial data if needed
    if (seedFn && typeof seedFn === "function") {
      await seedFn();
    }

    // Verify the setup is working correctly
    if (verifyFn && typeof verifyFn === "function") {
      setTimeout(async () => {
        await verifyFn();
      }, 2000);
    }

    return mongoose.connection;
  } catch (err) {
    logger.error("MongoDB connection error", err);
    throw err;
  }
};

/**
 * Gracefully close the database connection
 *
 * @param {Object} logger - Logger instance
 * @returns {Promise} Promise resolving when database is disconnected
 */
export const closeDatabase = async (logger) => {
  try {
    await mongoose.connection.close(false);
    logger.info("MongoDB connection closed successfully");
    return true;
  } catch (err) {
    logger.error("Error closing MongoDB connection", err);
    throw err;
  }
};

/**
 * Get the current database connection status
 *
 * @returns {Object} Object containing database status
 */
export const getDatabaseStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const readyState = mongoose.connection.readyState;

  return {
    status: states[readyState] || "unknown",
    connected: readyState === 1,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };
};
