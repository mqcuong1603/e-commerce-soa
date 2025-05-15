import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import ProductImage from "../models/productImage.model.js";
import Review from "../models/review.model.js";
import DiscountCode from "../models/discountCode.model.js";
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";
import Cart from "../models/cart.model.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to JSON data directory
const DATA_DIR = path.join(__dirname, "../data");

// Check if data exists before seeding
const checkDataExists = async () => {
  const userCount = await User.countDocuments();
  const categoryCount = await Category.countDocuments();
  const productCount = await Product.countDocuments();
  const addressCount = await Address.countDocuments();
  const discountCount = await DiscountCode.countDocuments();
  const orderCount = await Order.countDocuments();

  return (
    userCount > 0 &&
    categoryCount > 0 &&
    productCount > 0 &&
    addressCount > 0 &&
    discountCount > 0 &&
    orderCount > 0
  );
};

// Read JSON file helper
const readJsonFile = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Seed users
const seedUsers = async () => {
  console.log("Seeding users...");

  const usersData = readJsonFile("users.json");
  if (!usersData) return null;

  const createdUsers = {};

  for (const userData of usersData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      createdUsers[userData.email] = existingUser;
      continue;
    }

    // Create new user - NOTE: Set the passwordHash field, not password
    const user = new User({
      email: userData.email,
      fullName: userData.fullName,
      passwordHash: userData.password, // This will trigger the pre-save hook
      role: userData.role || "customer",
      status: userData.status || "active",
      loyaltyPoints: userData.loyaltyPoints || 0,
    });

    await user.save(); // The pre-save hook will hash the password
    createdUsers[userData.email] = user;
    console.log(`User ${userData.email} created successfully`);
  }

  console.log("Users created successfully");
  return createdUsers;
};

// Seed addresses
const seedAddresses = async (users) => {
  console.log("Seeding addresses...");

  const addressesData = readJsonFile("addresses.json");
  if (!addressesData) return;

  for (const addressData of addressesData) {
    // Map user email to ID
    if (addressData.userEmail && users[addressData.userEmail]) {
      addressData.userId = users[addressData.userEmail]._id;
    } else {
      console.log(`User ${addressData.userEmail} not found, skipping address`);
      continue;
    }
    delete addressData.userEmail; // Remove the helper field

    try {
      // Create the address
      const address = new Address(addressData);
      await address.save();
      console.log(`Address created for user ${addressData.fullName}`);
    } catch (error) {
      console.error(`Error creating address: ${error.message}`);
    }
  }

  console.log("Addresses created successfully");
};

// Seed categories
const seedCategories = async () => {
  console.log("Seeding categories...");

  const categoriesData = readJsonFile("categories.json");
  if (!categoriesData) return null;

  const createdCategories = {};

  // Create main categories first
  const mainCategories = categoriesData.filter((cat) => !cat.parentName);
  for (const category of mainCategories) {
    const newCategory = new Category(category);
    await newCategory.save();
    createdCategories[category.name] = newCategory;
  }

  // Then create subcategories (which need parent IDs)
  const subCategories = categoriesData.filter((cat) => cat.parentName);
  for (const category of subCategories) {
    // Replace parent name with parent ID
    const parentName = category.parentName;
    if (parentName && createdCategories[parentName]) {
      category.parentId = createdCategories[parentName]._id;
    } else {
      console.log(
        `Parent category "${parentName}" not found for "${category.name}"`
      );
    }
    delete category.parentName; // Remove the helper field

    const newCategory = new Category(category);
    await newCategory.save();
    createdCategories[category.name] = newCategory;
  }

  console.log("Categories created successfully");
  return createdCategories;
};

// Seed products
const seedProducts = async (categories) => {
  console.log("Seeding products...");

  const productsData = readJsonFile("products.json");
  if (!productsData) return null;

  const createdProducts = {};
  const createdVariants = {};

  for (const product of productsData) {
    // Map category names to IDs
    if (product.categoryNames && Array.isArray(product.categoryNames)) {
      product.categories = product.categoryNames
        .map((name) => (categories[name] ? categories[name]._id : null))
        .filter((id) => id !== null);
    }
    delete product.categoryNames; // Remove the helper field

    // Extract variants and images before creating the product
    const { variants, images, ...productData } = product;

    // Create product
    const newProduct = new Product(productData);
    await newProduct.save();
    createdProducts[product.name.toLowerCase()] = newProduct;

    // Create variants
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        const newVariant = new ProductVariant({
          ...variant,
          productId: newProduct._id,
        });
        await newVariant.save();
        // Store variant by SKU for orders
        createdVariants[variant.sku] = newVariant;
      }
    }

    // Create images
    if (images && Array.isArray(images)) {
      for (const image of images) {
        const newImage = new ProductImage({
          ...image,
          productId: newProduct._id,
        });
        await newImage.save();
      }
    }
  }

  console.log("Products created successfully");
  return { products: createdProducts, variants: createdVariants };
};

// Seed reviews
const seedReviews = async (products, users) => {
  console.log("Seeding reviews...");

  const reviewsData = readJsonFile("reviews.json");
  if (!reviewsData) return;

  // Log product and user mappings for debugging
  console.log("Product mapping for reviews:", Object.keys(products));
  console.log("User mapping for reviews:", Object.keys(users));

  for (const reviewData of reviewsData) {
    // Map product name to ID
    if (
      reviewData.productName &&
      products[reviewData.productName.toLowerCase()]
    ) {
      reviewData.productId = products[reviewData.productName.toLowerCase()]._id;
      delete reviewData.productName;
    } else {
      console.log(
        `Product ${reviewData.productName} not found, skipping review`
      );
      continue;
    }

    // Map user email to ID (if not a guest review)
    if (reviewData.userEmail && reviewData.userEmail !== "guest@example.com") {
      if (users[reviewData.userEmail]) {
        reviewData.userId = users[reviewData.userEmail]._id;
      } else {
        console.log(
          `User ${reviewData.userEmail} not found, creating as guest review`
        );
        // Leave userId as null for guest reviews
      }
    }
    delete reviewData.userEmail; // Remove the helper field

    try {
      // Create the review
      const review = new Review(reviewData);
      await review.save();
      console.log(
        `Review created for product ${reviewData.productId} by ${reviewData.userName}`
      );

      // Update product's average rating
      const product = await Product.findById(reviewData.productId);
      if (product) {
        await product.updateRating();
      }
    } catch (error) {
      console.error(`Error creating review: ${error.message}`);
    }
  }

  console.log("Reviews created successfully");
};

// Seed discount codes
const seedDiscountCodes = async (users) => {
  console.log("Seeding discount codes...");

  const discountCodesData = readJsonFile("discountCodes.json");
  if (!discountCodesData) return null;

  const createdDiscountCodes = {};

  for (const discountData of discountCodesData) {
    // Check if discount code already exists
    const existingCode = await DiscountCode.findOne({
      code: discountData.code,
    });
    if (existingCode) {
      console.log(
        `Discount code ${discountData.code} already exists, skipping...`
      );
      createdDiscountCodes[discountData.code] = existingCode;
      continue;
    }

    // Map admin email to ID for created by
    let createdBy = null;
    if (discountData.createdByEmail && users[discountData.createdByEmail]) {
      createdBy = users[discountData.createdByEmail]._id;
    } else {
      console.log(
        `Admin user ${discountData.createdByEmail} not found for discount code ${discountData.code}`
      );
      // Try to find any admin user as a fallback
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        createdBy = adminUser._id;
      }
    }

    // Create new discount code
    const discountCode = new DiscountCode({
      code: discountData.code,
      discountType: discountData.discountType,
      discountValue: discountData.discountValue,
      usageLimit: discountData.usageLimit,
      usedCount: discountData.usedCount || 0,
      createdBy: createdBy,
      isActive:
        discountData.isActive !== undefined ? discountData.isActive : true,
    });

    await discountCode.save();
    createdDiscountCodes[discountData.code] = discountCode;
    console.log(`Discount code ${discountData.code} created successfully`);
  }

  console.log("Discount codes created successfully");
  return createdDiscountCodes;
};

// Seed orders and order statuses
const seedOrders = async (users, products, variants) => {
  console.log("Seeding orders...");

  const ordersData = readJsonFile("orders.json");
  if (!ordersData) return null;

  const createdOrders = {};

  for (const orderData of ordersData) {
    // Map user email to ID
    let userId = null;
    if (orderData.userEmail && users[orderData.userEmail]) {
      userId = users[orderData.userEmail]._id;
    } else {
      console.log(
        `User ${orderData.userEmail} not found for order ${orderData.orderNumber}, creating as guest order`
      );
    }

    // Process order items
    const processedItems = [];
    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        // Find variant by SKU
        let variantId = null;
        if (item.sku && variants[item.sku]) {
          variantId = variants[item.sku]._id;
        } else {
          console.log(
            `Variant with SKU ${item.sku} not found for order ${orderData.orderNumber}, skipping item`
          );
          continue;
        }

        processedItems.push({
          productVariantId: variantId,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        });
      }
    }

    // Create order
    const order = new Order({
      orderNumber: orderData.orderNumber,
      userId: userId,
      email: orderData.userEmail,
      fullName: orderData.fullName,
      shippingAddress: orderData.shippingAddress,
      items: processedItems,
      subtotal: orderData.subtotal,
      shippingFee: orderData.shippingFee,
      tax: orderData.tax || 0,
      discountCode: orderData.discountCode,
      discountAmount: orderData.discountAmount || 0,
      loyaltyPointsUsed: orderData.loyaltyPointsUsed || 0,
      loyaltyPointsEarned: orderData.loyaltyPointsEarned || 0,
      total: orderData.total,
      paymentStatus: orderData.paymentStatus || "pending",
      createdAt: orderData.createdAt
        ? new Date(orderData.createdAt)
        : new Date(),
    });

    await order.save();
    createdOrders[orderData.orderNumber] = order;
    console.log(`Order ${orderData.orderNumber} created successfully`);

    // Create order statuses
    if (orderData.statusHistory && Array.isArray(orderData.statusHistory)) {
      for (const statusData of orderData.statusHistory) {
        const status = new OrderStatus({
          orderId: order._id,
          status: statusData.status,
          note: statusData.note,
          createdAt: statusData.createdAt
            ? new Date(statusData.createdAt)
            : new Date(),
        });
        await status.save();
      }
      console.log(
        `Created ${orderData.statusHistory.length} status entries for order ${orderData.orderNumber}`
      );
    }
  }

  console.log("Orders and statuses created successfully");
  return createdOrders;
};

// Seed carts
const seedCarts = async (users, variants) => {
  console.log("Seeding carts...");

  const cartsData = readJsonFile("carts.json");
  if (!cartsData) return null;

  for (const cartData of cartsData) {
    // Handle user cart or guest cart
    let userId = null;
    let sessionId = cartData.sessionId;

    if (cartData.userEmail && users[cartData.userEmail]) {
      userId = users[cartData.userEmail]._id;
      sessionId = null; // If user is set, no session ID needed
    }

    // Process cart items
    const processedItems = [];
    if (cartData.items && Array.isArray(cartData.items)) {
      for (const item of cartData.items) {
        // Find variant by SKU or ID
        let variantId = null;
        if (item.productVariantId && variants[item.productVariantId]) {
          variantId = variants[item.productVariantId]._id;
        } else {
          console.log(`Variant not found for cart item, skipping`);
          continue;
        }

        processedItems.push({
          productVariantId: variantId,
          quantity: item.quantity,
          price: item.price,
          addedAt: new Date(),
        });
      }
    }

    // Create cart
    const cart = new Cart({
      userId: userId,
      sessionId: sessionId,
      items: processedItems,
      createdAt: cartData.createdAt ? new Date(cartData.createdAt) : new Date(),
      updatedAt: cartData.updatedAt ? new Date(cartData.updatedAt) : new Date(),
      expiresAt: cartData.expiresAt ? new Date(cartData.expiresAt) : null,
    });

    await cart.save();
    console.log(
      `Cart created for ${
        userId ? "user " + cartData.userEmail : "session " + sessionId
      }`
    );
  }

  console.log("Carts created successfully");
};

// Main seeding function
export const seedDatabaseFromJson = async () => {
  try {
    console.log("Checking if database needs seeding...");

    // Check if data already exists
    const dataExists = await checkDataExists();
    if (dataExists) {
      console.log("Database already contains data, skipping seeding");
      return;
    }

    console.log("Starting database seeding from JSON files...");

    // Seed users first
    const users = await seedUsers();

    // Seed addresses (depends on users)
    await seedAddresses(users);

    // Seed categories
    const categories = await seedCategories();

    // Seed products and get variants
    const { products, variants } = await seedProducts(categories);

    // Seed discount codes (depends on admin users)
    const discountCodes = await seedDiscountCodes(users);

    // Seed orders (depends on users, products and variants)
    const orders = await seedOrders(users, products, variants);

    // Seed reviews (depends on users and products)
    await seedReviews(products, users);

    // Seed carts (depends on users and variants)
    await seedCarts(users, variants);

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

export default seedDatabaseFromJson;
