// utils/verifySetup.js
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verify database connection and collections
const verifyDatabase = async () => {
  console.log("Verifying database connection and data...");

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB is not connected");
      return false;
    }
    console.log("✅ MongoDB is connected");

    // Check if admin user exists
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.error("❌ Admin user not found");
      return false;
    }
    console.log(`✅ Admin user found: ${adminUser.email}`);

    // Check categories
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      console.error("❌ No categories found");
      return false;
    }
    console.log(`✅ Categories found: ${categoriesCount}`);

    // Check products
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      console.error("❌ No products found");
      return false;
    }
    console.log(`✅ Products found: ${productsCount}`);

    return true;
  } catch (error) {
    console.error("Error verifying database:", error);
    return false;
  }
};

// Verify environment variables
const verifyEnvironment = () => {
  console.log("Verifying environment variables...");

  const requiredVars = ["PORT", "MONGODB_URI", "JWT_SECRET", "SESSION_SECRET"];
  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error(
      `❌ Missing environment variables: ${missingVars.join(", ")}`
    );
    return false;
  }

  console.log("✅ All required environment variables are set");
  return true;
};

// Main verification function
const verifySetup = async () => {
  console.log("Starting system verification...");

  const envCheck = verifyEnvironment();
  const dbCheck = await verifyDatabase();

  if (envCheck && dbCheck) {
    console.log("✅ System verification complete. All checks passed!");
    console.log("Demo store is ready for use!");
    console.log("\nAdmin credentials:");
    console.log("Email: admin@example.com");
    console.log("Password: Admin123!");
    console.log("\nAPI base URL: http://localhost:3000");
    return true;
  } else {
    console.error(
      "❌ System verification failed. Please check the errors above."
    );
    return false;
  }
};

export default verifySetup;
