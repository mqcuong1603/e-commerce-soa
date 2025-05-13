// import mongoose from "mongoose";
// import User from "../models/user.model.js";
// import Category from "../models/category.model.js";
// import Product from "../models/product.model.js";
// import ProductVariant from "../models/productVariant.model.js";
// import ProductImage from "../models/productImage.model.js";
// import { hash } from "bcryptjs";

// // Configuration
// const ADMIN_EMAIL = "admin@example.com";
// const ADMIN_PASSWORD = "Admin123!";

// // Check if data exists before seeding
// const checkDataExists = async () => {
//   const userCount = await User.countDocuments();
//   const categoryCount = await Category.countDocuments();
//   const productCount = await Product.countDocuments();

//   return userCount > 0 && categoryCount > 0 && productCount > 0;
// };

// // Seed admin user
// const seedAdminUser = async () => {
//   console.log("Seeding admin user...");

//   // Check if admin already exists
//   const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
//   if (existingAdmin) {
//     console.log("Admin user already exists, skipping...");
//     return;
//   }

//   // Create admin user
//   const passwordHash = await hash(ADMIN_PASSWORD, 10);
//   const adminUser = new User({
//     email: ADMIN_EMAIL,
//     fullName: "Admin User",
//     passwordHash,
//     role: "admin",
//     status: "active",
//   });

//   await adminUser.save();
//   console.log("Admin user created successfully");
//   return adminUser;
// };

// // Seed categories
// const seedCategories = async () => {
//   console.log("Seeding categories...");

//   // Main categories
//   const mainCategories = [
//     {
//       name: "Laptops",
//       description: "Portable computers for work and play",
//       image: "/images/categories/laptops.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "Monitors",
//       description: "Displays for computers and gaming",
//       image: "/images/categories/monitors.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "Storage",
//       description: "Storage solutions for all your data needs",
//       image: "/images/categories/storage.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },
//     {
//       name: "Processors",
//       description: "CPUs for desktops and laptops",
//       image: "/images/categories/processors.jpg",
//       isActive: true,
//       sortOrder: 4,
//     },
//     {
//       name: "Motherboards",
//       description: "The foundation of your computer build",
//       image: "/images/categories/motherboards.jpg",
//       isActive: true,
//       sortOrder: 5,
//     },
//     {
//       name: "Graphics Cards",
//       description: "GPUs for gaming and content creation",
//       image: "/images/categories/gpu.jpg",
//       isActive: true,
//       sortOrder: 6,
//     },
//     {
//       name: "RAM",
//       description: "Memory modules for your computer",
//       image: "/images/categories/ram.jpg",
//       isActive: true,
//       sortOrder: 7,
//     },
//     {
//       name: "Power Supplies",
//       description: "Power your computer build reliably",
//       image: "/images/categories/psu.jpg",
//       isActive: true,
//       sortOrder: 8,
//     },
//     {
//       name: "Cooling & Cases",
//       description: "Cases and cooling solutions for your PC",
//       image: "/images/categories/cooling-cases.jpg",
//       isActive: true,
//       sortOrder: 9,
//     },
//   ];

//   // Create main categories
//   const createdCategories = {};

//   for (const category of mainCategories) {
//     const newCategory = new Category(category);
//     await newCategory.save();
//     createdCategories[category.name] = newCategory;
//   }

//   // Subcategories
//   const subCategories = [
//     // Laptop Subcategories
//     {
//       name: "Ultrabooks",
//       description: "Ultra-thin, lightweight laptops with premium performance",
//       parentId: createdCategories["Laptops"]._id,
//       image: "/images/categories/ultrabooks.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "Gaming Laptops",
//       description: "High-performance laptops designed for gaming",
//       parentId: createdCategories["Laptops"]._id,
//       image: "/images/categories/gaming-laptops.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "Business Laptops",
//       description: "Reliable laptops for business and productivity",
//       parentId: createdCategories["Laptops"]._id,
//       image: "/images/categories/business-laptops.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },
//     {
//       name: "2-in-1 Convertibles",
//       description:
//         "Versatile devices that function as both laptops and tablets",
//       parentId: createdCategories["Laptops"]._id,
//       image: "/images/categories/convertibles.jpg",
//       isActive: true,
//       sortOrder: 4,
//     },
//     {
//       name: "MacBooks/Chromebooks",
//       description: "Apple MacBooks and Google Chromebooks",
//       parentId: createdCategories["Laptops"]._id,
//       image: "/images/categories/macbooks-chromebooks.jpg",
//       isActive: true,
//       sortOrder: 5,
//     },

//     // Monitor Subcategories
//     {
//       name: "Full HD Monitors",
//       description: "1080p displays for everyday computing",
//       parentId: createdCategories["Monitors"]._id,
//       image: "/images/categories/fullhd-monitors.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "4K Monitors",
//       description: "Ultra high definition displays for detailed visuals",
//       parentId: createdCategories["Monitors"]._id,
//       image: "/images/categories/4k-monitors.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "Curved Monitors",
//       description: "Immersive curved displays for enhanced viewing experience",
//       parentId: createdCategories["Monitors"]._id,
//       image: "/images/categories/curved-monitors.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },
//     {
//       name: "Gaming Monitors",
//       description: "High refresh rate monitors for competitive gaming",
//       parentId: createdCategories["Monitors"]._id,
//       image: "/images/categories/gaming-monitors.jpg",
//       isActive: true,
//       sortOrder: 4,
//     },
//     {
//       name: "Professional Monitors",
//       description: "Color-accurate displays for creative professionals",
//       parentId: createdCategories["Monitors"]._id,
//       image: "/images/categories/professional-monitors.jpg",
//       isActive: true,
//       sortOrder: 5,
//     },

//     // Storage Subcategories
//     {
//       name: "Internal SSD",
//       description: "Fast solid state drives for system and application storage",
//       parentId: createdCategories["Storage"]._id,
//       image: "/images/categories/internal-ssd.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "Internal HDD",
//       description: "High capacity hard disk drives for mass storage",
//       parentId: createdCategories["Storage"]._id,
//       image: "/images/categories/internal-hdd.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "External SSD",
//       description: "Portable solid state drives for on-the-go storage",
//       parentId: createdCategories["Storage"]._id,
//       image: "/images/categories/external-ssd.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },
//     {
//       name: "External HDD",
//       description: "High capacity external drives for backups and archives",
//       parentId: createdCategories["Storage"]._id,
//       image: "/images/categories/external-hdd.jpg",
//       isActive: true,
//       sortOrder: 4,
//     },
//     {
//       name: "USB Flash Drives",
//       description: "Compact storage devices for easy file transfer",
//       parentId: createdCategories["Storage"]._id,
//       image: "/images/categories/usb-drives.jpg",
//       isActive: true,
//       sortOrder: 5,
//     },

//     // Processor Subcategories
//     {
//       name: "Intel Processors",
//       description: "Intel CPUs for desktops and laptops",
//       parentId: createdCategories["Processors"]._id,
//       image: "/images/categories/intel-cpus.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "AMD Processors",
//       description: "AMD CPUs for desktops and laptops",
//       parentId: createdCategories["Processors"]._id,
//       image: "/images/categories/amd-cpus.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "Desktop CPUs",
//       description: "High-performance processors for desktop computers",
//       parentId: createdCategories["Processors"]._id,
//       image: "/images/categories/desktop-cpus.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },
//     {
//       name: "Laptop CPUs",
//       description: "Energy-efficient processors for laptops",
//       parentId: createdCategories["Processors"]._id,
//       image: "/images/categories/laptop-cpus.jpg",
//       isActive: true,
//       sortOrder: 4,
//     },

//     // Motherboard Subcategories
//     {
//       name: "Intel Compatible",
//       description: "Motherboards compatible with Intel processors",
//       parentId: createdCategories["Motherboards"]._id,
//       image: "/images/categories/intel-motherboards.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "AMD Compatible",
//       description: "Motherboards compatible with AMD processors",
//       parentId: createdCategories["Motherboards"]._id,
//       image: "/images/categories/amd-motherboards.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "ATX Motherboards",
//       description: "Standard ATX, Micro-ATX, and Mini-ITX form factors",
//       parentId: createdCategories["Motherboards"]._id,
//       image: "/images/categories/atx-motherboards.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },

//     // Graphics Cards Subcategories
//     {
//       name: "NVIDIA GPUs",
//       description: "NVIDIA graphics cards for gaming and content creation",
//       parentId: createdCategories["Graphics Cards"]._id,
//       image: "/images/categories/nvidia-gpus.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "AMD GPUs",
//       description: "AMD graphics cards for gaming and content creation",
//       parentId: createdCategories["Graphics Cards"]._id,
//       image: "/images/categories/amd-gpus.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "Integrated GPUs",
//       description: "Integrated graphics solutions",
//       parentId: createdCategories["Graphics Cards"]._id,
//       image: "/images/categories/integrated-gpus.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },

//     // RAM Subcategories
//     {
//       name: "Desktop RAM",
//       description: "Memory modules for desktop computers",
//       parentId: createdCategories["RAM"]._id,
//       image: "/images/categories/desktop-ram.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "Laptop RAM",
//       description: "Memory modules for laptops",
//       parentId: createdCategories["RAM"]._id,
//       image: "/images/categories/laptop-ram.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "DDR4/DDR5",
//       description: "Latest generation memory modules",
//       parentId: createdCategories["RAM"]._id,
//       image: "/images/categories/ddr5-ram.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },

//     // Power Supply Subcategories
//     {
//       name: "Modular PSUs",
//       description: "Power supplies with detachable cables for clean builds",
//       parentId: createdCategories["Power Supplies"]._id,
//       image: "/images/categories/modular-psu.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "Non-Modular PSUs",
//       description: "Traditional power supplies with fixed cables",
//       parentId: createdCategories["Power Supplies"]._id,
//       image: "/images/categories/non-modular-psu.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "High Wattage PSUs",
//       description: "Power supplies from 650W to 1600W+",
//       parentId: createdCategories["Power Supplies"]._id,
//       image: "/images/categories/high-wattage-psu.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },

//     // Cooling & Cases Subcategories
//     {
//       name: "CPU Coolers",
//       description: "Air and liquid cooling solutions for processors",
//       parentId: createdCategories["Cooling & Cases"]._id,
//       image: "/images/categories/cpu-coolers.jpg",
//       isActive: true,
//       sortOrder: 1,
//     },
//     {
//       name: "Case Fans",
//       description: "Fans for optimal airflow in PC cases",
//       parentId: createdCategories["Cooling & Cases"]._id,
//       image: "/images/categories/case-fans.jpg",
//       isActive: true,
//       sortOrder: 2,
//     },
//     {
//       name: "PC Cases",
//       description: "Cases in various form factors for your PC build",
//       parentId: createdCategories["Cooling & Cases"]._id,
//       image: "/images/categories/pc-cases.jpg",
//       isActive: true,
//       sortOrder: 3,
//     },
//   ];

//   // Create subcategories
//   for (const category of subCategories) {
//     const newCategory = new Category(category);
//     await newCategory.save();
//     createdCategories[category.name] = newCategory;
//   }

//   console.log("Categories created successfully");
//   return createdCategories;
// };

// // Seed products
// const seedProducts = async (categories) => {
//   console.log("Seeding products...");

//   // Sample products for different categories
//   const products = [
//     // ULTRABOOKS - 4 products
//     {
//       name: "Dell XPS 13",
//       brand: "Dell",
//       description:
//         "The Dell XPS 13 is a premium ultrabook with an InfinityEdge display that maximizes screen space. Featuring a 13.4-inch 4K display with minimal bezels, it delivers stunning visuals for both work and entertainment. Powered by Intel's latest Core processors and up to 32GB of RAM, this ultrabook handles multitasking with ease. The precision-engineered CNC aluminum chassis and carbon fiber palm rest provide durability while maintaining a lightweight profile under 2.8 pounds. With up to 12 hours of battery life and Thunderbolt 4 connectivity, it's perfect for professionals on the go. The backlit keyboard and large precision touchpad ensure comfortable use in any environment.",
//       shortDescription:
//         "Premium ultrabook with InfinityEdge display and all-day battery life",
//       basePrice: 1299.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [categories["Ultrabooks"]._id, categories["Laptops"]._id],
//       tags: ["ultrabook", "premium", "dell", "infinity edge", "lightweight"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 256GB",
//           sku: "XPS13-I5-8-256",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "8GB LPDDR4X",
//             storage: "256GB PCIe NVMe SSD",
//             display: '13.4" FHD+ (1920 x 1200)',
//             color: "Platinum Silver",
//           },
//           price: 1299.99,
//           salePrice: 1199.99,
//           inventory: 35,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 512GB",
//           sku: "XPS13-I7-16-512",
//           attributes: {
//             processor: "Intel Core i7-1185G7",
//             memory: "16GB LPDDR4X",
//             storage: "512GB PCIe NVMe SSD",
//             display: '13.4" 4K UHD+ (3840 x 2400) Touch',
//             color: "Platinum Silver",
//           },
//           price: 1799.99,
//           salePrice: null,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/dell-xps13-1.jpg",
//           isMain: true,
//           alt: "Dell XPS 13 front view",
//         },
//         {
//           imageUrl: "/images/products/dell-xps13-2.jpg",
//           isMain: false,
//           alt: "Dell XPS 13 side view",
//         },
//         {
//           imageUrl: "/images/products/dell-xps13-3.jpg",
//           isMain: false,
//           alt: "Dell XPS 13 keyboard view",
//         },
//       ],
//     },
//     {
//       name: "HP Spectre x360",
//       brand: "HP",
//       description:
//         "The HP Spectre x360 redefines versatility with its 360-degree hinge design, allowing you to use it as a laptop, tablet, or in tent mode. The gem-cut design and dual-chamfered edges showcase exceptional craftsmanship, while the 13.3-inch OLED touchscreen display delivers vibrant colors and true blacks for an immersive viewing experience. Powered by Intel Evo platform with 11th Gen processors, it offers remarkable performance and responsiveness. The Spectre features HP's True Vision HD IR camera with integrated privacy switch, fingerprint reader, and Bang & Olufsen quad speakers for premium security and audio. With up to 16 hours of battery life and fast charging capabilities, it's the perfect companion for creative professionals who need power and flexibility.",
//       shortDescription:
//         "Versatile 2-in-1 ultrabook with gem-cut design and OLED display",
//       basePrice: 1349.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["Ultrabooks"]._id,
//         categories["2-in-1 Convertibles"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["ultrabook", "2-in-1", "convertible", "hp", "oled"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 512GB",
//           sku: "SPECTRE-I5-8-512",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "8GB LPDDR4X",
//             storage: "512GB PCIe NVMe SSD",
//             display: '13.3" FHD IPS Touch',
//             color: "Nightfall Black",
//           },
//           price: 1349.99,
//           salePrice: 1249.99,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 1TB",
//           sku: "SPECTRE-I7-16-1TB",
//           attributes: {
//             processor: "Intel Core i7-1165G7",
//             memory: "16GB LPDDR4X",
//             storage: "1TB PCIe NVMe SSD",
//             display: '13.3" 4K OLED Touch',
//             color: "Poseidon Blue",
//           },
//           price: 1849.99,
//           salePrice: null,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/hp-spectre-1.jpg",
//           isMain: true,
//           alt: "HP Spectre x360 front view",
//         },
//         {
//           imageUrl: "/images/products/hp-spectre-2.jpg",
//           isMain: false,
//           alt: "HP Spectre x360 tablet mode",
//         },
//         {
//           imageUrl: "/images/products/hp-spectre-3.jpg",
//           isMain: false,
//           alt: "HP Spectre x360 tent mode",
//         },
//       ],
//     },
//     {
//       name: "Lenovo ThinkPad X1 Carbon",
//       brand: "Lenovo",
//       description:
//         "The ThinkPad X1 Carbon is Lenovo's flagship ultrabook built for business professionals who demand performance and reliability. The carbon fiber reinforced chassis provides military-grade durability while keeping weight under 2.5 pounds. Powered by Intel Core processors and up to 32GB of memory, it handles demanding business applications with ease. The 14-inch display offers options from FHD to 4K with Dolby Vision, delivering exceptional clarity for presentations and content creation. The legendary ThinkPad keyboard with TrackPoint provides the most comfortable typing experience, while Modern Standby keeps your system up to date even while sleeping. With ThinkShield security solutions including Match-on-Chip fingerprint reader and human-presence detection, your data stays protected in any environment. The rapid charge technology provides up to 80% battery in just an hour, ideal for professionals on the move.",
//       shortDescription:
//         "Business-class ultrabook with carbon fiber chassis and legendary ThinkPad keyboard",
//       basePrice: 1499.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["Ultrabooks"]._id,
//         categories["Business Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["ultrabook", "business", "thinkpad", "lenovo", "carbon fiber"],
//       variants: [
//         {
//           name: "Core i5 / 16GB / 256GB",
//           sku: "X1CARBON-I5-16-256",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "16GB LPDDR4X",
//             storage: "256GB PCIe SSD",
//             display: '14" FHD IPS Anti-Glare',
//             color: "Black",
//           },
//           price: 1499.99,
//           salePrice: 1399.99,
//           inventory: 30,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 32GB / 1TB",
//           sku: "X1CARBON-I7-32-1TB",
//           attributes: {
//             processor: "Intel Core i7-1185G7 vPro",
//             memory: "32GB LPDDR4X",
//             storage: "1TB PCIe SSD",
//             display: '14" 4K UHD IPS Dolby Vision',
//             color: "Black",
//           },
//           price: 2199.99,
//           salePrice: null,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/thinkpad-x1-1.jpg",
//           isMain: true,
//           alt: "ThinkPad X1 Carbon front view",
//         },
//         {
//           imageUrl: "/images/products/thinkpad-x1-2.jpg",
//           isMain: false,
//           alt: "ThinkPad X1 Carbon open view",
//         },
//         {
//           imageUrl: "/images/products/thinkpad-x1-3.jpg",
//           isMain: false,
//           alt: "ThinkPad X1 Carbon keyboard view",
//         },
//       ],
//     },
//     {
//       name: "LG Gram 16",
//       brand: "LG",
//       description:
//         "The LG Gram 16 redefines what's possible in an ultralight laptop, packing a 16-inch display into a chassis weighing just under 2.6 pounds. Its WQXGA (2560 x 1600) IPS display offers 99% DCI-P3 color gamut coverage, perfect for content creators who need accurate color reproduction. Despite its lightweight design, the LG Gram doesn't compromise on durability, meeting the MIL-STD-810G military specification for shock, dust, and extreme temperatures. The 80Wh battery provides up to 22 hours of use on a single charge, while the 11th Gen Intel Core processors and Iris Xe graphics deliver excellent performance for productivity tasks. With a full complement of ports including Thunderbolt 4, HDMI, and microSD reader, plus a responsive fingerprint reader integrated into the power button, the LG Gram combines portability, performance, and security in one sleek package.",
//       shortDescription:
//         "Ultra-lightweight 16-inch laptop with long battery life and military-grade durability",
//       basePrice: 1399.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: false,
//       categoryIds: [categories["Ultrabooks"]._id, categories["Laptops"]._id],
//       tags: ["ultrabook", "lightweight", "lg", "16-inch", "long battery"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 512GB",
//           sku: "GRAM16-I5-8-512",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "8GB LPDDR4X",
//             storage: "512GB NVMe SSD",
//             display: '16" WQXGA (2560x1600) IPS',
//             color: "White",
//           },
//           price: 1399.99,
//           salePrice: 1299.99,
//           inventory: 25,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 1TB",
//           sku: "GRAM16-I7-16-1TB",
//           attributes: {
//             processor: "Intel Core i7-1165G7",
//             memory: "16GB LPDDR4X",
//             storage: "1TB NVMe SSD",
//             display: '16" WQXGA (2560x1600) IPS',
//             color: "Black",
//           },
//           price: 1799.99,
//           salePrice: 1699.99,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/lg-gram-1.jpg",
//           isMain: true,
//           alt: "LG Gram 16 front view",
//         },
//         {
//           imageUrl: "/images/products/lg-gram-2.jpg",
//           isMain: false,
//           alt: "LG Gram 16 side view",
//         },
//         {
//           imageUrl: "/images/products/lg-gram-3.jpg",
//           isMain: false,
//           alt: "LG Gram 16 keyboard view",
//         },
//       ],
//     },

//     // GAMING LAPTOPS - 3 products
//     {
//       name: "ASUS ROG Zephyrus G15",
//       brand: "ASUS",
//       description:
//         "The ASUS ROG Zephyrus G15 represents the pinnacle of gaming laptop engineering, combining raw power with surprising portability. At just 4.2 pounds and 0.8 inches thin, it houses AMD's Ryzen 9 processor and NVIDIA GeForce RTX graphics in a sleek magnesium-alloy chassis. The 15.6-inch QHD display features a 165Hz refresh rate, 3ms response time, and 100% DCI-P3 color gamut, delivering smooth gameplay and vibrant visuals. The custom cooling system with liquid metal compound keeps temperatures under control even during intense gaming sessions. With six speakers enhanced by Dolby Atmos technology, the audio experience matches the visual quality. The per-key RGB backlit keyboard, comprehensive port selection, and Wi-Fi 6 connectivity round out this premium gaming machine designed for competitive gamers and content creators alike.",
//       shortDescription:
//         "Premium gaming laptop with Ryzen 9 processor and RTX graphics in a portable form factor",
//       basePrice: 1799.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["Gaming Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["gaming", "laptop", "asus", "rog", "rtx", "ryzen"],
//       variants: [
//         {
//           name: "RTX 3070 / 16GB / 1TB",
//           sku: "ROG-ZEPH-G15-3070",
//           attributes: {
//             processor: "AMD Ryzen 9 5900HS",
//             memory: "16GB DDR4 3200MHz",
//             storage: "1TB NVMe SSD",
//             display: '15.6" QHD 165Hz',
//             graphics: "NVIDIA GeForce RTX 3070 8GB",
//           },
//           price: 1799.99,
//           salePrice: 1699.99,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "RTX 3080 / 32GB / 1TB",
//           sku: "ROG-ZEPH-G15-3080",
//           attributes: {
//             processor: "AMD Ryzen 9 5900HS",
//             memory: "32GB DDR4 3200MHz",
//             storage: "1TB NVMe SSD",
//             display: '15.6" QHD 165Hz',
//             graphics: "NVIDIA GeForce RTX 3080 8GB",
//           },
//           price: 2199.99,
//           salePrice: null,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/rog-zephyrus-1.jpg",
//           isMain: true,
//           alt: "ASUS ROG Zephyrus G15 front view",
//         },
//         {
//           imageUrl: "/images/products/rog-zephyrus-2.jpg",
//           isMain: false,
//           alt: "ASUS ROG Zephyrus G15 open view",
//         },
//         {
//           imageUrl: "/images/products/rog-zephyrus-3.jpg",
//           isMain: false,
//           alt: "ASUS ROG Zephyrus G15 rear view",
//         },
//       ],
//     },
//     {
//       name: "Alienware m17 R4",
//       brand: "Dell",
//       description:
//         "The Alienware m17 R4 is a performance powerhouse designed for serious gamers who demand the ultimate gaming experience. Its 17.3-inch display options include a lightning-fast 360Hz FHD panel for competitive gaming or a 4K UHD display for stunning visual fidelity. Powered by Intel's 10th Gen Core i9 processors and NVIDIA's GeForce RTX 30-series graphics, it handles the most demanding AAA titles with ease. Alienware's Advanced Cryo-Tech cooling technology with vapor chamber designs keeps temperatures in check during extended gaming sessions. The per-key RGB AlienFX lighting system with 16.8 million colors lets you customize your gaming setup, while the Cherry MX ultra-low profile mechanical keyboard provides the tactile feedback gamers love. With Thunderbolt 3, HDMI 2.1, and a full array of USB ports, connectivity is never an issue for this desktop replacement powerhouse.",
//       shortDescription:
//         "High-performance 17-inch gaming laptop with 360Hz display and RTX graphics",
//       basePrice: 2499.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["Gaming Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["gaming", "laptop", "alienware", "dell", "rtx", "17-inch"],
//       variants: [
//         {
//           name: "RTX 3070 / 16GB / 1TB",
//           sku: "AW-M17-R4-3070",
//           attributes: {
//             processor: "Intel Core i7-10870H",
//             memory: "16GB DDR4 2933MHz",
//             storage: "1TB PCIe M.2 SSD",
//             display: '17.3" FHD 360Hz',
//             graphics: "NVIDIA GeForce RTX 3070 8GB",
//           },
//           price: 2499.99,
//           salePrice: 2299.99,
//           inventory: 15,
//           isActive: true,
//         },
//         {
//           name: "RTX 3080 / 32GB / 2TB",
//           sku: "AW-M17-R4-3080",
//           attributes: {
//             processor: "Intel Core i9-10980HK",
//             memory: "32GB DDR4 2933MHz",
//             storage: "2TB RAID0 (2x 1TB PCIe M.2 SSD)",
//             display: '17.3" UHD 60Hz',
//             graphics: "NVIDIA GeForce RTX 3080 16GB",
//           },
//           price: 3299.99,
//           salePrice: null,
//           inventory: 10,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/alienware-m17-1.jpg",
//           isMain: true,
//           alt: "Alienware m17 R4 front view",
//         },
//         {
//           imageUrl: "/images/products/alienware-m17-2.jpg",
//           isMain: false,
//           alt: "Alienware m17 R4 open view",
//         },
//         {
//           imageUrl: "/images/products/alienware-m17-3.jpg",
//           isMain: false,
//           alt: "Alienware m17 R4 side view",
//         },
//       ],
//     },
//     {
//       name: "MSI GE76 Raider",
//       brand: "MSI",
//       description:
//         "The MSI GE76 Raider is a desktop-class gaming laptop featuring an aggressive design with panoramic aurora lighting that creates an immersive gaming atmosphere. Its 17.3-inch display offers up to a 360Hz refresh rate with a 3ms response time, keeping you competitive in fast-paced games. Powered by Intel's 11th Gen Core i9 processor and NVIDIA GeForce RTX graphics, it delivers exceptional frame rates even at maximum settings. MSI's exclusive Cooler Boost 5 technology with two fans and six heat pipes ensures optimal thermal performance under load. The SteelSeries per-key RGB gaming keyboard provides both style and functionality, while the Dynaudio Speakers with Nahimic 3 audio deliver an immersive sound experience. With Wi-Fi 6E support, Thunderbolt 4, and a full range of I/O ports, the GE76 Raider sets a new standard for gaming laptops.",
//       shortDescription:
//         "High-end 17-inch gaming laptop with panoramic aurora lighting and desktop-class performance",
//       basePrice: 2299.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [
//         categories["Gaming Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["gaming", "laptop", "msi", "raider", "rtx", "intel"],
//       variants: [
//         {
//           name: "RTX 3070 / 32GB / 1TB",
//           sku: "MSI-GE76-3070",
//           attributes: {
//             processor: "Intel Core i7-11800H",
//             memory: "32GB DDR4 3200MHz",
//             storage: "1TB NVMe SSD",
//             display: '17.3" FHD 360Hz',
//             graphics: "NVIDIA GeForce RTX 3070 8GB",
//           },
//           price: 2299.99,
//           salePrice: 2199.99,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "RTX 3080 / 64GB / 2TB",
//           sku: "MSI-GE76-3080",
//           attributes: {
//             processor: "Intel Core i9-11980HK",
//             memory: "64GB DDR4 3200MHz",
//             storage: "2TB NVMe SSD",
//             display: '17.3" UHD 120Hz',
//             graphics: "NVIDIA GeForce RTX 3080 16GB",
//           },
//           price: 3199.99,
//           salePrice: 2999.99,
//           inventory: 10,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/msi-ge76-1.jpg",
//           isMain: true,
//           alt: "MSI GE76 Raider front view",
//         },
//         {
//           imageUrl: "/images/products/msi-ge76-2.jpg",
//           isMain: false,
//           alt: "MSI GE76 Raider open view",
//         },
//         {
//           imageUrl: "/images/products/msi-ge76-3.jpg",
//           isMain: false,
//           alt: "MSI GE76 Raider side view",
//         },
//       ],
//     },

//     // BUSINESS LAPTOPS - 3 products
//     {
//       name: "Lenovo ThinkPad T14",
//       brand: "Lenovo",
//       description:
//         "The Lenovo ThinkPad T14 is the cornerstone of business computing, combining robust performance with legendary ThinkPad reliability. Built to MIL-STD-810G standards, it withstands the rigors of business travel while delivering enterprise-grade security features including dTPM encryption, ThinkShutter camera cover, and optional IR camera for facial recognition. The 14-inch display options range from standard FHD to 4K UHD with Dolby Vision, ensuring excellent visibility in any environment. Powered by Intel's 11th Gen processors with Iris Xe graphics or AMD Ryzen PRO 5000 series, it handles business applications with ease. The spill-resistant keyboard with TrackPoint maintains the ThinkPad legacy, while rapid charging technology keeps you productive with minimal downtime. With comprehensive connectivity including Thunderbolt 4, HDMI, and optional 4G/5G WWAN, the ThinkPad T14 is the reliable workhorse that business professionals depend on.",
//       shortDescription:
//         "Enterprise-grade business laptop with legendary ThinkPad durability and security features",
//       basePrice: 1249.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["Business Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["business", "laptop", "thinkpad", "lenovo", "enterprise"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 256GB",
//           sku: "TP-T14-I5-8-256",
//           attributes: {
//             processor: "Intel Core i5-1145G7 vPro",
//             memory: "8GB DDR4 3200MHz",
//             storage: "256GB PCIe SSD",
//             display: '14" FHD IPS Anti-Glare',
//             color: "Black",
//           },
//           price: 1249.99,
//           salePrice: 1149.99,
//           inventory: 30,
//           isActive: true,
//         },
//         {
//           name: "Ryzen 7 / 16GB / 512GB",
//           sku: "TP-T14-R7-16-512",
//           attributes: {
//             processor: "AMD Ryzen 7 PRO 5850U",
//             memory: "16GB DDR4 3200MHz",
//             storage: "512GB PCIe SSD",
//             display: '14" FHD IPS Anti-Glare',
//             color: "Black",
//           },
//           price: 1549.99,
//           salePrice: 1449.99,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/thinkpad-t14-1.jpg",
//           isMain: true,
//           alt: "Lenovo ThinkPad T14 front view",
//         },
//         {
//           imageUrl: "/images/products/thinkpad-t14-2.jpg",
//           isMain: false,
//           alt: "Lenovo ThinkPad T14 open view",
//         },
//         {
//           imageUrl: "/images/products/thinkpad-t14-3.jpg",
//           isMain: false,
//           alt: "Lenovo ThinkPad T14 side view",
//         },
//       ],
//     },
//     {
//       name: "Dell Latitude 7420",
//       brand: "Dell",
//       description:
//         "The Dell Latitude 7420 is the ultimate business laptop designed for professionals who demand performance, security, and manageability. Available in both traditional clamshell and 2-in-1 convertible designs, it adapts to any work style. The 14-inch display offers FHD or 4K options with ComfortView Plus, which reduces blue light without sacrificing color accuracy. Intel's 11th Gen processors with vPro technology provide enterprise-level performance and remote management capabilities. Dell Optimizer, an AI-based optimization system, learns how you work and adapts to your style, improving application performance, battery life, and audio quality automatically. Security features include Dell SafeGuard and Response, TPM 2.0, and optional fingerprint reader and smart card reader. The aluminum or carbon fiber chassis (depending on configuration) meets MIL-STD-810H standards for durability while maintaining a professional appearance suitable for any business environment.",
//       shortDescription:
//         "Premium business laptop with AI-optimized performance and advanced security features",
//       basePrice: 1399.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["Business Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["business", "laptop", "dell", "latitude", "enterprise", "vpro"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 256GB",
//           sku: "LAT-7420-I5-8-256",
//           attributes: {
//             processor: "Intel Core i5-1145G7 vPro",
//             memory: "8GB LPDDR4X",
//             storage: "256GB M.2 PCIe NVMe SSD",
//             display: '14" FHD (1920 x 1080)',
//             chassis: "Aluminum",
//           },
//           price: 1399.99,
//           salePrice: 1299.99,
//           inventory: 25,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 512GB",
//           sku: "LAT-7420-I7-16-512",
//           attributes: {
//             processor: "Intel Core i7-1185G7 vPro",
//             memory: "16GB LPDDR4X",
//             storage: "512GB M.2 PCIe NVMe SSD",
//             display: '14" 4K UHD (3840 x 2160)',
//             chassis: "Carbon Fiber",
//           },
//           price: 1899.99,
//           salePrice: null,
//           inventory: 20,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/latitude-7420-1.jpg",
//           isMain: true,
//           alt: "Dell Latitude 7420 front view",
//         },
//         {
//           imageUrl: "/images/products/latitude-7420-2.jpg",
//           isMain: false,
//           alt: "Dell Latitude 7420 open view",
//         },
//         {
//           imageUrl: "/images/products/latitude-7420-3.jpg",
//           isMain: false,
//           alt: "Dell Latitude 7420 side view",
//         },
//       ],
//     },
//     {
//       name: "HP EliteBook 840 G8",
//       brand: "HP",
//       description:
//         "The HP EliteBook 840 G8 is a premium business laptop crafted for today's hybrid work environments. Its lightweight magnesium chassis houses powerful components while maintaining a slim profile that's easy to carry between home and office. The 14-inch display offers options from FHD to UHD with HP Sure View Reflect integrated privacy screen, preventing visual hacking in public spaces. Powered by Intel's 11th Gen processors with vPro technology, it delivers the performance needed for multitasking and demanding business applications. HP's Wolf Security for Business provides enhanced protection against modern cyber threats, while AI-based noise reduction ensures clear conference calls even in noisy environments. The HP Fast Charge technology delivers 50% battery in just 30 minutes, keeping you productive throughout the workday. With enterprise-grade manageability features and optional 5G connectivity, the EliteBook 840 G8 is a complete business solution that adapts to changing work requirements.",
//       shortDescription:
//         "Premium business laptop with integrated privacy features and enhanced security",
//       basePrice: 1449.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [
//         categories["Business Laptops"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["business", "laptop", "hp", "elitebook", "enterprise", "security"],
//       variants: [
//         {
//           name: "Core i5 / 16GB / 256GB",
//           sku: "EB-840-I5-16-256",
//           attributes: {
//             processor: "Intel Core i5-1145G7 vPro",
//             memory: "16GB DDR4 3200MHz",
//             storage: "256GB PCIe NVMe SSD",
//             display: '14" FHD IPS Anti-Glare',
//             security: "HP Sure View Reflect",
//           },
//           price: 1449.99,
//           salePrice: 1349.99,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 32GB / 1TB",
//           sku: "EB-840-I7-32-1TB",
//           attributes: {
//             processor: "Intel Core i7-1185G7 vPro",
//             memory: "32GB DDR4 3200MHz",
//             storage: "1TB PCIe NVMe SSD",
//             display: '14" 4K UHD IPS Anti-Glare',
//             security: "HP Sure View Reflect",
//           },
//           price: 1949.99,
//           salePrice: 1849.99,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/elitebook-840-1.jpg",
//           isMain: true,
//           alt: "HP EliteBook 840 G8 front view",
//         },
//         {
//           imageUrl: "/images/products/elitebook-840-2.jpg",
//           isMain: false,
//           alt: "HP EliteBook 840 G8 open view",
//         },
//         {
//           imageUrl: "/images/products/elitebook-840-3.jpg",
//           isMain: false,
//           alt: "HP EliteBook 840 G8 side view",
//         },
//       ],
//     },

//     // 2-IN-1 CONVERTIBLES - 3 products
//     {
//       name: "Microsoft Surface Pro 8",
//       brand: "Microsoft",
//       description:
//         "The Microsoft Surface Pro 8 redefines the versatility of a professional 2-in-1 device with its stunning 13-inch PixelSense Flow Display featuring 120Hz refresh rate and Dolby Vision. This flagship detachable combines the power of a laptop with the flexibility of a tablet, featuring Intel's Evo platform with 11th Gen processors that deliver up to 16 hours of battery life. The redesigned Surface Slim Pen 2 provides the sensation of pen on paper with haptic feedback, while the detachable keyboard features convenient storage and charging for the pen. With Thunderbolt 4 ports, advanced cameras with 4K video, and studio microphones, it's optimized for productivity and creative work. The kickstand adjusts to nearly 180 degrees, allowing for multiple working positions, while Windows 11 takes advantage of the versatile form factor with improved touch and pen interfaces.",
//       shortDescription:
//         "Premium 2-in-1 detachable with 120Hz display and Thunderbolt 4 connectivity",
//       basePrice: 1099.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["2-in-1 Convertibles"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: [
//         "2-in-1",
//         "convertible",
//         "tablet",
//         "surface",
//         "microsoft",
//         "stylus",
//       ],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 128GB",
//           sku: "SURFACE-PRO8-I5-8-128",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "8GB LPDDR4x",
//             storage: "128GB SSD",
//             display: '13" PixelSense Flow 120Hz',
//             color: "Platinum",
//           },
//           price: 1099.99,
//           salePrice: 999.99,
//           inventory: 30,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 256GB",
//           sku: "SURFACE-PRO8-I7-16-256",
//           attributes: {
//             processor: "Intel Core i7-1185G7",
//             memory: "16GB LPDDR4x",
//             storage: "256GB SSD",
//             display: '13" PixelSense Flow 120Hz',
//             color: "Graphite",
//           },
//           price: 1599.99,
//           salePrice: null,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/surface-pro8-1.jpg",
//           isMain: true,
//           alt: "Microsoft Surface Pro 8 tablet mode",
//         },
//         {
//           imageUrl: "/images/products/surface-pro8-2.jpg",
//           isMain: false,
//           alt: "Microsoft Surface Pro 8 laptop mode",
//         },
//         {
//           imageUrl: "/images/products/surface-pro8-3.jpg",
//           isMain: false,
//           alt: "Microsoft Surface Pro 8 studio mode",
//         },
//       ],
//     },
//     {
//       name: "Lenovo Yoga 9i",
//       brand: "Lenovo",
//       description:
//         "The Lenovo Yoga 9i is a premium 2-in-1 convertible that blends stunning design with powerful performance. Its all-metal chassis features a unique Shadow Black finish with optional genuine leather cover on the lid and a built-in soundbar hinge that delivers immersive Dolby Atmos audio in any mode. The 14-inch touchscreen offers options from FHD to UHD with Dolby Vision HDR support, providing vibrant colors and contrast. Powered by Intel's 11th Gen processors with Iris Xe graphics, it handles everything from productivity tasks to creative applications with ease. The garaged stylus provides precise input for note-taking and artistic endeavors, while the edge-to-edge glass palm rest with haptic touchpad creates a modern, minimalist aesthetic. With Thunderbolt 4 connectivity, Wi-Fi 6, and up to 15 hours of battery life, the Yoga 9i delivers a premium convertible experience for discerning users.",
//       shortDescription:
//         "Premium 2-in-1 convertible with rotating soundbar and optional leather cover",
//       basePrice: 1249.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["2-in-1 Convertibles"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["2-in-1", "convertible", "yoga", "lenovo", "soundbar", "stylus"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 256GB",
//           sku: "YOGA-9I-I5-8-256",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "8GB LPDDR4X",
//             storage: "256GB PCIe SSD",
//             display: '14" FHD IPS Touch',
//             color: "Shadow Black",
//           },
//           price: 1249.99,
//           salePrice: 1149.99,
//           inventory: 25,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 512GB / Leather",
//           sku: "YOGA-9I-I7-16-512-L",
//           attributes: {
//             processor: "Intel Core i7-1185G7",
//             memory: "16GB LPDDR4X",
//             storage: "512GB PCIe SSD",
//             display: '14" UHD IPS Touch',
//             color: "Shadow Black with Leather Cover",
//           },
//           price: 1649.99,
//           salePrice: null,
//           inventory: 20,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/yoga-9i-1.jpg",
//           isMain: true,
//           alt: "Lenovo Yoga 9i front view",
//         },
//         {
//           imageUrl: "/images/products/yoga-9i-2.jpg",
//           isMain: false,
//           alt: "Lenovo Yoga 9i tent mode",
//         },
//         {
//           imageUrl: "/images/products/yoga-9i-3.jpg",
//           isMain: false,
//           alt: "Lenovo Yoga 9i tablet mode",
//         },
//       ],
//     },
//     {
//       name: "HP Spectre x360 14",
//       brand: "HP",
//       description:
//         "The HP Spectre x360 14 represents the pinnacle of convertible laptop design, featuring a stunning 3:2 aspect ratio OLED display that provides more vertical space for documents and web browsing. The gem-cut, dual-chamfer design showcases exceptional craftsmanship with its precision-milled aluminum chassis. Powered by Intel's 11th Gen processors with Iris Xe graphics, it delivers excellent performance for both productivity and creative tasks. The convertible design allows for four usage modes: laptop, tablet, tent, and presentation, adapting to your workflow. HP's Smart Sense technology automatically adjusts performance and thermal profiles based on AI-driven detection of surface, lighting, and application usage patterns. Security features include a dedicated webcam kill switch, fingerprint reader, and IR camera for Windows Hello. With Thunderbolt 4, Wi-Fi 6, and up to 17 hours of battery life, the Spectre x360 14 is the perfect productivity partner for discerning professionals.",
//       shortDescription:
//         "Premium convertible laptop with 3:2 OLED display and gem-cut design",
//       basePrice: 1299.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [
//         categories["2-in-1 Convertibles"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["2-in-1", "convertible", "hp", "spectre", "oled", "3:2 display"],
//       variants: [
//         {
//           name: "Core i5 / 8GB / 256GB",
//           sku: "SPECTRE-X360-14-I5-8-256",
//           attributes: {
//             processor: "Intel Core i5-1135G7",
//             memory: "8GB LPDDR4X",
//             storage: "256GB PCIe NVMe SSD",
//             display: '14" 3:2 FHD+ IPS Touch',
//             color: "Nightfall Black",
//           },
//           price: 1299.99,
//           salePrice: 1199.99,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "Core i7 / 16GB / 1TB",
//           sku: "SPECTRE-X360-14-I7-16-1TB",
//           attributes: {
//             processor: "Intel Core i7-1165G7",
//             memory: "16GB LPDDR4X",
//             storage: "1TB PCIe NVMe SSD",
//             display: '14" 3:2 3K2K OLED Touch',
//             color: "Poseidon Blue",
//           },
//           price: 1799.99,
//           salePrice: 1699.99,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/spectre-x360-14-1.jpg",
//           isMain: true,
//           alt: "HP Spectre x360 14 front view",
//         },
//         {
//           imageUrl: "/images/products/spectre-x360-14-2.jpg",
//           isMain: false,
//           alt: "HP Spectre x360 14 tent mode",
//         },
//         {
//           imageUrl: "/images/products/spectre-x360-14-3.jpg",
//           isMain: false,
//           alt: "HP Spectre x360 14 tablet mode",
//         },
//       ],
//     },

//     // MACBOOKS/CHROMEBOOKS - 3 products
//     {
//       name: "Apple MacBook Pro 16",
//       brand: "Apple",
//       description:
//         "The Apple MacBook Pro 16 with M1 Pro/Max chip represents a paradigm shift in professional laptops, combining unprecedented performance with exceptional efficiency. The stunning 16.2-inch Liquid Retina XDR display delivers up to 1600 nits of peak brightness with extreme dynamic range and P3 wide color gamut, perfect for HDR content creation. Apple's custom M1 Pro and M1 Max chips provide exceptional CPU and GPU performance while maintaining up to 21 hours of battery life. The redesigned chassis features a comprehensive port selection including HDMI, SDXC card slot, and MagSafe 3 charging, reducing the need for dongles. The new six-speaker sound system with force-cancelling woofers creates an immersive audio experience, while the studio-quality microphone array captures pristine audio for calls and recordings. With a Magic Keyboard that includes full-height function keys and Touch ID, the MacBook Pro 16 delivers the ultimate macOS experience for creative professionals and developers.",
//       shortDescription:
//         "Professional-grade laptop with Apple M1 Pro/Max chip and Liquid Retina XDR display",
//       basePrice: 2499.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["MacBooks/Chromebooks"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["apple", "macbook", "m1", "xdr", "pro", "macos"],
//       variants: [
//         {
//           name: "M1 Pro / 16GB / 512GB",
//           sku: "MACBOOK-PRO-16-PRO-16-512",
//           attributes: {
//             processor: "Apple M1 Pro 10-core",
//             memory: "16GB Unified Memory",
//             storage: "512GB SSD",
//             display: '16.2" Liquid Retina XDR',
//             color: "Space Gray",
//           },
//           price: 2499.99,
//           salePrice: null,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "M1 Max / 32GB / 1TB",
//           sku: "MACBOOK-PRO-16-MAX-32-1TB",
//           attributes: {
//             processor: "Apple M1 Max 10-core",
//             memory: "32GB Unified Memory",
//             storage: "1TB SSD",
//             display: '16.2" Liquid Retina XDR',
//             color: "Silver",
//           },
//           price: 3499.99,
//           salePrice: null,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/macbook-pro-16-1.jpg",
//           isMain: true,
//           alt: "Apple MacBook Pro 16 front view",
//         },
//         {
//           imageUrl: "/images/products/macbook-pro-16-2.jpg",
//           isMain: false,
//           alt: "Apple MacBook Pro 16 side view",
//         },
//         {
//           imageUrl: "/images/products/macbook-pro-16-3.jpg",
//           isMain: false,
//           alt: "Apple MacBook Pro 16 keyboard view",
//         },
//       ],
//     },
//     {
//       name: "Apple MacBook Air M1",
//       brand: "Apple",
//       description:
//         "The Apple MacBook Air with M1 chip redefines what a thin and light laptop can do. At just 2.8 pounds and with a fanless design, it maintains complete silence even under heavy workloads. The M1 chip delivers exceptional performance with 8-core CPU and up to 8-core GPU, allowing it to outperform previous MacBook Air models by leaps and bounds. The 13.3-inch Retina display with P3 wide color gamut brings vivid colors and sharp text to everything from photos to documents. With up to 18 hours of battery life, you can work through an entire day on a single charge. The Magic Keyboard provides a comfortable typing experience, while Touch ID offers secure authentication and Apple Pay purchases. With instant wake from sleep, Wi-Fi 6, and two Thunderbolt/USB 4 ports, the MacBook Air combines exceptional performance with the portability that made the Air line famous.",
//       shortDescription:
//         "Ultra-lightweight laptop with Apple M1 chip and all-day battery life",
//       basePrice: 999.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["MacBooks/Chromebooks"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["apple", "macbook", "m1", "lightweight", "macos"],
//       variants: [
//         {
//           name: "M1 / 8GB / 256GB",
//           sku: "MACBOOK-AIR-M1-8-256",
//           attributes: {
//             processor: "Apple M1 8-core",
//             memory: "8GB Unified Memory",
//             storage: "256GB SSD",
//             display: '13.3" Retina',
//             color: "Space Gray",
//           },
//           price: 999.99,
//           salePrice: 899.99,
//           inventory: 30,
//           isActive: true,
//         },
//         {
//           name: "M1 / 16GB / 512GB",
//           sku: "MACBOOK-AIR-M1-16-512",
//           attributes: {
//             processor: "Apple M1 8-core",
//             memory: "16GB Unified Memory",
//             storage: "512GB SSD",
//             display: '13.3" Retina',
//             color: "Gold",
//           },
//           price: 1399.99,
//           salePrice: null,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/macbook-air-1.jpg",
//           isMain: true,
//           alt: "Apple MacBook Air front view",
//         },
//         {
//           imageUrl: "/images/products/macbook-air-2.jpg",
//           isMain: false,
//           alt: "Apple MacBook Air side view",
//         },
//         {
//           imageUrl: "/images/products/macbook-air-3.jpg",
//           isMain: false,
//           alt: "Apple MacBook Air keyboard view",
//         },
//       ],
//     },
//     {
//       name: "Google Pixelbook Go",
//       brand: "Google",
//       description:
//         "The Google Pixelbook Go is the quintessential Chromebook for professionals and students who need a lightweight, reliable laptop with exceptional battery life. Its distinctive rippled underside provides a secure grip, while the magnesium chassis keeps weight under 2.3 pounds without sacrificing durability. The 13.3-inch touchscreen display offers options from Full HD to 4K, with a matte finish that reduces glare in bright environments. The backlit keyboard features Google's Hush Keys design for quiet typing even in silent rooms, perfect for libraries and shared workspaces. With up to 12 hours of battery life and quick charging that provides 2 hours of use from just 20 minutes of charging, the Pixelbook Go keeps you productive all day. Chrome OS's quick boot, automatic updates, and built-in virus protection provide a hassle-free experience, while Google Assistant integration enables voice commands and intelligent features throughout the system.",
//       shortDescription:
//         "Ultra-portable Chromebook with quiet keyboard and long battery life",
//       basePrice: 649.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["MacBooks/Chromebooks"]._id,
//         categories["Laptops"]._id,
//       ],
//       tags: ["google", "chromebook", "pixelbook", "chrome os", "lightweight"],
//       variants: [
//         {
//           name: "Core m3 / 8GB / 64GB",
//           sku: "PIXELBOOK-GO-M3-8-64",
//           attributes: {
//             processor: "Intel Core m3-8100Y",
//             memory: "8GB RAM",
//             storage: "64GB eMMC",
//             display: '13.3" Full HD Touch',
//             color: "Just Black",
//           },
//           price: 649.99,
//           salePrice: 599.99,
//           inventory: 25,
//           isActive: true,
//         },
//         {
//           name: "Core i5 / 16GB / 128GB",
//           sku: "PIXELBOOK-GO-I5-16-128",
//           attributes: {
//             processor: "Intel Core i5-8200Y",
//             memory: "16GB RAM",
//             storage: "128GB eMMC",
//             display: '13.3" 4K Ultra HD Touch',
//             color: "Not Pink",
//           },
//           price: 999.99,
//           salePrice: 949.99,
//           inventory: 20,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/pixelbook-go-1.jpg",
//           isMain: true,
//           alt: "Google Pixelbook Go front view",
//         },
//         {
//           imageUrl: "/images/products/pixelbook-go-2.jpg",
//           isMain: false,
//           alt: "Google Pixelbook Go bottom view",
//         },
//         {
//           imageUrl: "/images/products/pixelbook-go-3.jpg",
//           isMain: false,
//           alt: "Google Pixelbook Go keyboard view",
//         },
//       ],
//     },

//     // FULL HD MONITORS - 3 products
//     {
//       name: "Dell S2721D",
//       brand: "Dell",
//       description:
//         "The Dell S2721D is a professional-grade 27-inch monitor that delivers exceptional clarity for productivity and casual content consumption. The 1440p QHD resolution offers 1.77 times more detail than Full HD, providing crisp text and sharp images without requiring the graphics power needed for 4K. Its IPS panel ensures accurate colors from virtually any angle with 99% sRGB coverage, making it suitable for photo editing and document work. The thoughtful design includes a slim profile with a small base footprint that reclaims valuable desk space, while the flicker-free screen with ComfortView technology reduces eye strain during long work sessions. With dual HDMI ports, a DisplayPort connection, and built-in 3W speakers, it eliminates cable clutter while providing essential functionality. The monitor's height-adjustable stand, tilt, and swivel capabilities allow for ergonomic positioning to maintain comfort throughout the workday.",
//       shortDescription:
//         "Professional 27-inch 1440p monitor with IPS panel and ergonomic stand",
//       basePrice: 249.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["Full HD Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "dell", "ips", "qhd", "1440p"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "DELL-S2721D",
//           attributes: {
//             size: '27"',
//             resolution: "2560 x 1440 (QHD)",
//             refreshRate: "75Hz",
//             responseTime: "4ms (GtG)",
//             panelType: "IPS",
//             ports: "2x HDMI 1.4, 1x DisplayPort 1.2",
//           },
//           price: 249.99,
//           salePrice: 229.99,
//           inventory: 45,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/dell-s2721d-1.jpg",
//           isMain: true,
//           alt: "Dell S2721D front view",
//         },
//         {
//           imageUrl: "/images/products/dell-s2721d-2.jpg",
//           isMain: false,
//           alt: "Dell S2721D back view",
//         },
//         {
//           imageUrl: "/images/products/dell-s2721d-3.jpg",
//           isMain: false,
//           alt: "Dell S2721D side view",
//         },
//       ],
//     },
//     {
//       name: "LG 24MP400-B",
//       brand: "LG",
//       description:
//         "The LG 24MP400-B is a versatile 24-inch Full HD monitor that delivers reliable performance for everyday computing and casual entertainment. Its 3-Side virtually borderless design creates an immersive viewing experience and seamless multi-monitor setups. The IPS panel provides wide viewing angles and accurate color reproduction with sRGB 99% color gamut, ensuring consistent image quality whether you're working on spreadsheets or watching videos. AMD FreeSync technology eliminates screen tearing and stuttering during fast-moving scenes, while Reader Mode reduces blue light to help prevent eye fatigue during extended use. The included OnScreen Control software allows for easy adjustment of monitor settings through a simple interface, and the VESA mount compatibility provides flexible installation options. With HDMI and D-Sub inputs, it offers convenient connectivity to various devices while maintaining an attractive price point for budget-conscious users.",
//       shortDescription:
//         "Affordable 24-inch Full HD IPS monitor with virtually borderless design",
//       basePrice: 149.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [
//         categories["Full HD Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "lg", "ips", "full hd", "budget", "freesync"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "LG-24MP400",
//           attributes: {
//             size: '24"',
//             resolution: "1920 x 1080 (FHD)",
//             refreshRate: "75Hz",
//             responseTime: "5ms (GtG)",
//             panelType: "IPS",
//             ports: "1x HDMI, 1x D-Sub (VGA)",
//           },
//           price: 149.99,
//           salePrice: 129.99,
//           inventory: 60,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/lg-24mp400-1.jpg",
//           isMain: true,
//           alt: "LG 24MP400-B front view",
//         },
//         {
//           imageUrl: "/images/products/lg-24mp400-2.jpg",
//           isMain: false,
//           alt: "LG 24MP400-B back view",
//         },
//         {
//           imageUrl: "/images/products/lg-24mp400-3.jpg",
//           isMain: false,
//           alt: "LG 24MP400-B side view",
//         },
//       ],
//     },
//     {
//       name: "Samsung SR350",
//       brand: "Samsung",
//       description:
//         "The Samsung SR350 is a sleek, business-oriented 24-inch monitor that combines essential features with Samsung's renowned display technology. The Full HD IPS panel provides clear, vibrant images with consistent colors across the 178° wide viewing angle, making it ideal for both work and entertainment. Eye Saver Mode reduces blue light emissions to minimize eye strain during long work sessions, while Flicker Free technology ensures comfortable viewing even during extended use. The 3-sided borderless design maximizes screen space and creates a sophisticated aesthetic for modern workspaces. AMD FreeSync support with 75Hz refresh rate delivers smooth visuals for casual gaming and video playback, eliminating screen tearing without requiring premium gaming hardware. The slim design and VESA mount compatibility offer flexible placement options, while HDMI and VGA inputs provide connectivity with legacy and modern devices, making it a versatile addition to any desk setup.",
//       shortDescription:
//         "Slim 24-inch business monitor with eye comfort features and 75Hz refresh rate",
//       basePrice: 159.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["Full HD Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "samsung", "ips", "full hd", "business", "eye saver"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "SAMSUNG-SR350",
//           attributes: {
//             size: '24"',
//             resolution: "1920 x 1080 (FHD)",
//             refreshRate: "75Hz",
//             responseTime: "5ms (GtG)",
//             panelType: "IPS",
//             ports: "1x HDMI, 1x D-Sub (VGA)",
//           },
//           price: 159.99,
//           salePrice: 149.99,
//           inventory: 50,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/samsung-sr350-1.jpg",
//           isMain: true,
//           alt: "Samsung SR350 front view",
//         },
//         {
//           imageUrl: "/images/products/samsung-sr350-2.jpg",
//           isMain: false,
//           alt: "Samsung SR350 back view",
//         },
//         {
//           imageUrl: "/images/products/samsung-sr350-3.jpg",
//           isMain: false,
//           alt: "Samsung SR350 side view",
//         },
//       ],
//     },

//     // 4K MONITORS - 3 products
//     {
//       name: "LG 27UN850-W",
//       brand: "LG",
//       description:
//         "The LG 27UN850-W is a premium 4K UHD monitor designed for creative professionals and content creators who demand color accuracy and versatility. The 27-inch IPS display delivers stunning clarity with over 8 million pixels and covers 95% of the DCI-P3 color spectrum, ensuring that photos and videos are displayed with exceptional accuracy. VESA DisplayHDR 400 certification brings high-dynamic-range content to life with deeper blacks and brighter highlights. The monitor's USB-C port provides a single-cable solution for display, data transfer, and charging (up to 60W) simultaneously, decluttering your workspace. AMD FreeSync technology ensures smooth, tear-free gaming at up to 60Hz in 4K resolution, while the ergonomic stand offers height, tilt, and pivot adjustments for optimal viewing comfort. The virtually borderless design enhances immersion whether you're editing video, designing graphics, or enjoying entertainment content in stunning 4K resolution.",
//       shortDescription:
//         "Professional 4K UHD monitor with USB-C connectivity and HDR support",
//       basePrice: 449.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["4K Monitors"]._id,
//         categories["Professional Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "4k", "uhd", "lg", "usb-c", "hdr", "ips"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "LG-27UN850",
//           attributes: {
//             size: '27"',
//             resolution: "3840 x 2160 (4K UHD)",
//             refreshRate: "60Hz",
//             responseTime: "5ms (GtG)",
//             panelType: "IPS",
//             ports: "2x HDMI, 1x DisplayPort, 1x USB-C, 2x USB 3.0",
//           },
//           price: 449.99,
//           salePrice: 429.99,
//           inventory: 30,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/lg-27un850-1.jpg",
//           isMain: true,
//           alt: "LG 27UN850-W front view",
//         },
//         {
//           imageUrl: "/images/products/lg-27un850-2.jpg",
//           isMain: false,
//           alt: "LG 27UN850-W back view",
//         },
//         {
//           imageUrl: "/images/products/lg-27un850-3.jpg",
//           isMain: false,
//           alt: "LG 27UN850-W side view",
//         },
//       ],
//     },
//     {
//       name: "Dell S2721QS",
//       brand: "Dell",
//       description:
//         "The Dell S2721QS offers 4K resolution in an affordable yet feature-rich package suitable for professionals and home users alike. The 27-inch IPS panel delivers exceptional clarity with 8.3 million pixels that make text razor-sharp and images remarkably detailed. With 99% sRGB and 95% DCI-P3 color coverage, it provides excellent color accuracy for photo editing and content creation, while ComfortView Plus technology reduces harmful blue light emissions without sacrificing color performance. The elegant design features a small base footprint and built-in cable management, maximizing desk space and minimizing clutter. HDR content support adds greater depth and detail to compatible media, while the integrated dual 3W speakers provide decent audio without requiring external speakers. The height-adjustable stand with tilt, swivel, and pivot options ensures ergonomic comfort throughout the workday, and VESA mounting compatibility offers alternative installation options.",
//       shortDescription:
//         "Affordable 4K monitor with excellent color accuracy and ergonomic stand",
//       basePrice: 329.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [categories["4K Monitors"]._id, categories["Monitors"]._id],
//       tags: ["monitor", "4k", "uhd", "dell", "ips", "affordable"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "DELL-S2721QS",
//           attributes: {
//             size: '27"',
//             resolution: "3840 x 2160 (4K UHD)",
//             refreshRate: "60Hz",
//             responseTime: "4ms (GtG)",
//             panelType: "IPS",
//             ports: "2x HDMI 2.0, 1x DisplayPort 1.2, Audio Line Out",
//           },
//           price: 329.99,
//           salePrice: 299.99,
//           inventory: 35,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/dell-s2721qs-1.jpg",
//           isMain: true,
//           alt: "Dell S2721QS front view",
//         },
//         {
//           imageUrl: "/images/products/dell-s2721qs-2.jpg",
//           isMain: false,
//           alt: "Dell S2721QS back view",
//         },
//         {
//           imageUrl: "/images/products/dell-s2721qs-3.jpg",
//           isMain: false,
//           alt: "Dell S2721QS side view",
//         },
//       ],
//     },
//     {
//       name: "ASUS ProArt PA279CV",
//       brand: "ASUS",
//       description:
//         "The ASUS ProArt PA279CV is a professional-grade 4K monitor calibrated for content creators who demand exceptional color accuracy and reliable performance. Factory calibrated to Delta E < 2, this 27-inch monitor ensures true-to-life colors right out of the box, while 100% sRGB and 100% Rec. 709 color space coverage meets industry standards for photo and video editing. The monitor includes ProArt Preset and ProArt Palette features for easy color customization and calibration to maintain color accuracy over time. USB-C connectivity with 65W Power Delivery allows single-cable connection to compatible laptops, simplifying the workspace while charging your device. The monitor includes built-in color calibration hardware to ensure long-term color accuracy, which is essential for professionals working on color-critical projects. The ergonomic stand provides extensive adjustments including height, tilt, swivel, and pivot, while an anti-glare coating and eye-care technologies ensure comfort during long editing sessions.",
//       shortDescription:
//         "Professional 4K monitor with factory calibration and USB-C connectivity",
//       basePrice: 499.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [
//         categories["4K Monitors"]._id,
//         categories["Professional Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "4k", "uhd", "asus", "proart", "calibrated", "usb-c"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "ASUS-PA279CV",
//           attributes: {
//             size: '27"',
//             resolution: "3840 x 2160 (4K UHD)",
//             refreshRate: "60Hz",
//             responseTime: "5ms (GtG)",
//             panelType: "IPS",
//             ports: "1x HDMI 2.0, 1x DisplayPort 1.2, 1x USB-C, 4x USB 3.1",
//           },
//           price: 499.99,
//           salePrice: null,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/asus-proart-1.jpg",
//           isMain: true,
//           alt: "ASUS ProArt PA279CV front view",
//         },
//         {
//           imageUrl: "/images/products/asus-proart-2.jpg",
//           isMain: false,
//           alt: "ASUS ProArt PA279CV back view",
//         },
//         {
//           imageUrl: "/images/products/asus-proart-3.jpg",
//           isMain: false,
//           alt: "ASUS ProArt PA279CV side view",
//         },
//       ],
//     },

//     // CURVED MONITORS - 3 products
//     {
//       name: "Samsung Odyssey G7",
//       brand: "Samsung",
//       description:
//         "The Samsung Odyssey G7 represents the pinnacle of curved gaming monitor technology with its aggressive 1000R curvature that matches the human eye's natural field of view for deeper immersion. The 32-inch QLED panel delivers stunning visuals with QHD resolution, HDR600 support, and 95% DCI-P3 color gamut coverage, ensuring vibrant colors and exceptional contrast. What truly sets this monitor apart is its blistering 240Hz refresh rate and 1ms response time, providing competitive gamers with the smoothest possible gameplay and minimal motion blur. G-Sync and FreeSync Premium Pro compatibility eliminate screen tearing across a wide range of graphics cards. The futuristic design features CoreSync lighting that adapts to on-screen content and a height-adjustable stand with tilt and swivel capabilities for ergonomic comfort during marathon gaming sessions. With DisplayPort 1.4 and HDMI 2.0 connections, the Odyssey G7 supports high frame rate gaming on both PC and next-gen consoles.",
//       shortDescription:
//         "1000R curved QLED gaming monitor with 240Hz refresh rate and HDR600",
//       basePrice: 699.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["Curved Monitors"]._id,
//         categories["Gaming Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "curved", "gaming", "samsung", "qled", "240hz", "hdr"],
//       variants: [
//         {
//           name: "32-inch Model",
//           sku: "SAMSUNG-G7-32",
//           attributes: {
//             size: '32"',
//             resolution: "2560 x 1440 (QHD)",
//             refreshRate: "240Hz",
//             responseTime: "1ms (GtG)",
//             panelType: "VA QLED",
//             curvature: "1000R",
//             ports: "2x DisplayPort 1.4, 1x HDMI 2.0, 2x USB 3.0",
//           },
//           price: 699.99,
//           salePrice: 649.99,
//           inventory: 20,
//           isActive: true,
//         },
//         {
//           name: "27-inch Model",
//           sku: "SAMSUNG-G7-27",
//           attributes: {
//             size: '27"',
//             resolution: "2560 x 1440 (QHD)",
//             refreshRate: "240Hz",
//             responseTime: "1ms (GtG)",
//             panelType: "VA QLED",
//             curvature: "1000R",
//             ports: "2x DisplayPort 1.4, 1x HDMI 2.0, 2x USB 3.0",
//           },
//           price: 599.99,
//           salePrice: 549.99,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/samsung-g7-1.jpg",
//           isMain: true,
//           alt: "Samsung Odyssey G7 front view",
//         },
//         {
//           imageUrl: "/images/products/samsung-g7-2.jpg",
//           isMain: false,
//           alt: "Samsung Odyssey G7 back view",
//         },
//         {
//           imageUrl: "/images/products/samsung-g7-3.jpg",
//           isMain: false,
//           alt: "Samsung Odyssey G7 side view",
//         },
//       ],
//     },
//     {
//       name: "MSI Optix MAG341CQ",
//       brand: "MSI",
//       description:
//         "The MSI Optix MAG341CQ is an ultrawide curved gaming monitor that offers an immersive experience at a competitive price point. The 34-inch panel features a 3440x1440 resolution with a 100Hz refresh rate, providing a significant upgrade over standard 60Hz displays without requiring top-tier graphics hardware. The 1800R curved VA panel delivers deep blacks and excellent contrast ratio, enhancing visibility in dark game scenes. With 110% sRGB coverage, it provides vivid colors for both gaming and content consumption. AMD FreeSync technology eliminates screen tearing for compatible graphics cards, while the anti-flicker technology and blue light reduction help reduce eye strain during extended gaming sessions. The monitor includes both DisplayPort and HDMI connections for versatile setups, and the adjustable stand allows for tilt adjustments to find the optimal viewing angle. The sleek design with thin bezels and customizable RGB lighting adds a touch of gaming aesthetic to any setup.",
//       shortDescription:
//         "34-inch ultrawide curved gaming monitor with 100Hz refresh rate and QHD resolution",
//       basePrice: 399.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [
//         categories["Curved Monitors"]._id,
//         categories["Gaming Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "curved", "ultrawide", "msi", "gaming", "100hz", "va"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "MSI-MAG341CQ",
//           attributes: {
//             size: '34"',
//             resolution: "3440 x 1440 (UWQHD)",
//             refreshRate: "100Hz",
//             responseTime: "8ms (GtG)",
//             panelType: "VA",
//             curvature: "1800R",
//             ports: "1x DisplayPort 1.2, 1x HDMI 2.0, 1x DVI",
//           },
//           price: 399.99,
//           salePrice: 379.99,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/msi-mag341cq-1.jpg",
//           isMain: true,
//           alt: "MSI Optix MAG341CQ front view",
//         },
//         {
//           imageUrl: "/images/products/msi-mag341cq-2.jpg",
//           isMain: false,
//           alt: "MSI Optix MAG341CQ back view",
//         },
//         {
//           imageUrl: "/images/products/msi-mag341cq-3.jpg",
//           isMain: false,
//           alt: "MSI Optix MAG341CQ side view",
//         },
//       ],
//     },
//     {
//       name: "Dell S3422DWG",
//       brand: "Dell",
//       description:
//         "The Dell S3422DWG delivers an immersive ultrawide gaming experience with its 34-inch curved VA panel and 3440x1440 resolution. The 1800R curvature enhances field of view and reduces eye movement, creating a more comfortable gaming experience during extended sessions. With a 144Hz refresh rate and 1ms MPRT response time, it provides smooth visuals with minimal motion blur in fast-paced games. The monitor supports AMD FreeSync Premium technology to eliminate screen tearing, while also being compatible with NVIDIA G-Sync for broader appeal. With 90% DCI-P3 color coverage, it provides vibrant colors for both gaming and content consumption. ComfortView Plus technology reduces harmful blue light emissions without compromising color accuracy, making it suitable for both day and night gaming sessions. The height-adjustable stand with tilt, swivel, and VESA mount compatibility ensures ergonomic comfort, while the comprehensive connectivity includes DisplayPort 1.4, HDMI, and USB ports for a versatile setup.",
//       shortDescription:
//         "34-inch ultrawide curved gaming monitor with 144Hz refresh rate and WQHD resolution",
//       basePrice: 449.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [
//         categories["Curved Monitors"]._id,
//         categories["Gaming Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: ["monitor", "curved", "ultrawide", "dell", "gaming", "144hz", "va"],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "DELL-S3422DWG",
//           attributes: {
//             size: '34"',
//             resolution: "3440 x 1440 (UWQHD)",
//             refreshRate: "144Hz",
//             responseTime: "1ms MPRT",
//             panelType: "VA",
//             curvature: "1800R",
//             ports: "1x DisplayPort 1.4, 2x HDMI 2.0, 4x USB 3.2",
//           },
//           price: 449.99,
//           salePrice: 429.99,
//           inventory: 20,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/dell-s3422dwg-1.jpg",
//           isMain: true,
//           alt: "Dell S3422DWG front view",
//         },
//         {
//           imageUrl: "/images/products/dell-s3422dwg-2.jpg",
//           isMain: false,
//           alt: "Dell S3422DWG back view",
//         },
//         {
//           imageUrl: "/images/products/dell-s3422dwg-3.jpg",
//           isMain: false,
//           alt: "Dell S3422DWG side view",
//         },
//       ],
//     },

//     // GAMING MONITORS - 3 products (already have Samsung Odyssey G7 and others that are in both categories)
//     {
//       name: "ASUS TUF Gaming VG27AQ",
//       brand: "ASUS",
//       description:
//         "The ASUS TUF Gaming VG27AQ is a professional-grade gaming monitor that combines high refresh rate, low response time, and HDR support in a 27-inch IPS panel. The 1440p resolution provides the perfect balance between visual clarity and gaming performance without requiring top-tier hardware. What sets this monitor apart is its ELMB-Sync technology, which allows simultaneous use of variable refresh rate (G-Sync Compatible) and ELMB (Extreme Low Motion Blur), eliminating both screen tearing and motion blur for crystal-clear gaming. The 165Hz refresh rate with 1ms response time ensures competitive-level performance in fast-paced games, while HDR10 support enhances visual impact in compatible games and media. GamePlus features provide in-game enhancements like crosshairs and timers, while GameVisual presets optimize display settings for different game genres. The ergonomic stand with height, tilt, swivel, and pivot adjustments ensures comfortable positioning for marathon gaming sessions, and the TUF Gaming certification guarantees reliability and durability.",
//       shortDescription:
//         "27-inch IPS gaming monitor with 165Hz refresh rate, G-Sync, and HDR support",
//       basePrice: 399.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [
//         categories["Gaming Monitors"]._id,
//         categories["Monitors"]._id,
//       ],
//       tags: [
//         "monitor",
//         "gaming",
//         "asus",
//         "tuf",
//         "ips",
//         "165hz",
//         "hdr",
//         "gsync",
//       ],
//       variants: [
//         {
//           name: "Standard Model",
//           sku: "ASUS-VG27AQ",
//           attributes: {
//             size: '27"',
//             resolution: "2560 x 1440 (QHD)",
//             refreshRate: "165Hz",
//             responseTime: "1ms (MPRT)",
//             panelType: "IPS",
//             ports: "2x HDMI 2.0, 1x DisplayPort 1.2",
//           },
//           price: 399.99,
//           salePrice: 379.99,
//           inventory: 30,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/asus-tuf-vg27aq-1.jpg",
//           isMain: true,
//           alt: "ASUS TUF Gaming VG27AQ front view",
//         },
//         {
//           imageUrl: "/images/products/asus-tuf-vg27aq-2.jpg",
//           isMain: false,
//           alt: "ASUS TUF Gaming VG27AQ back view",
//         },
//         {
//           imageUrl: "/images/products/asus-tuf-vg27aq-3.jpg",
//           isMain: false,
//           alt: "ASUS TUF Gaming VG27AQ side view",
//         },
//       ],
//     },

//     // PROFESSIONAL MONITORS - Already have LG 27UN850-W and ASUS ProArt PA279CV in this category

//     // INTERNAL SSD - 3 products
//     {
//       name: "Samsung 980 PRO",
//       brand: "Samsung",
//       description:
//         "The Samsung 980 PRO represents the pinnacle of NVMe SSD technology, leveraging PCIe 4.0 to deliver sequential read speeds up to 7,000 MB/s and write speeds up to 5,000 MB/s - nearly twice as fast as PCIe 3.0 SSDs. As Samsung's fastest consumer SSD, it features V-NAND technology and a proprietary Elpis controller optimized for speed and efficiency. The drive maintains lower operating temperatures thanks to its nickel-coated controller and effective heat dissipation layer, ensuring consistent performance during intensive tasks like 4K video editing, 3D rendering, and high-end gaming. Samsung's Dynamic Thermal Guard technology automatically minimizes performance fluctuations during extended use, while the streamlined, compact M.2 form factor makes it ideal for next-gen desktops and laptop upgrades. Samsung Magician software provides robust SSD management tools for monitoring drive health, performing firmware updates, and optimizing performance over time.",
//       shortDescription:
//         "High-performance PCIe 4.0 NVMe SSD with speeds up to 7,000 MB/s",
//       basePrice: 229.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [categories["Internal SSD"]._id, categories["Storage"]._id],
//       tags: ["storage", "ssd", "nvme", "samsung", "pcie4", "m.2"],
//       variants: [
//         {
//           name: "500GB",
//           sku: "SM-980PRO-500",
//           attributes: {
//             capacity: "500GB",
//             interface: "PCIe 4.0 x4, NVMe 1.3c",
//             readSpeed: "6,900 MB/s",
//             writeSpeed: "5,000 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "300 TB",
//           },
//           price: 229.99,
//           salePrice: 199.99,
//           inventory: 35,
//           isActive: true,
//         },
//         {
//           name: "1TB",
//           sku: "SM-980PRO-1TB",
//           attributes: {
//             capacity: "1TB",
//             interface: "PCIe 4.0 x4, NVMe 1.3c",
//             readSpeed: "7,000 MB/s",
//             writeSpeed: "5,000 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "600 TB",
//           },
//           price: 399.99,
//           salePrice: 349.99,
//           inventory: 30,
//           isActive: true,
//         },
//         {
//           name: "2TB",
//           sku: "SM-980PRO-2TB",
//           attributes: {
//             capacity: "2TB",
//             interface: "PCIe 4.0 x4, NVMe 1.3c",
//             readSpeed: "7,000 MB/s",
//             writeSpeed: "5,100 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "1,200 TB",
//           },
//           price: 729.99,
//           salePrice: 649.99,
//           inventory: 20,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/samsung-980pro-1.jpg",
//           isMain: true,
//           alt: "Samsung 980 PRO front view",
//         },
//         {
//           imageUrl: "/images/products/samsung-980pro-2.jpg",
//           isMain: false,
//           alt: "Samsung 980 PRO angle view",
//         },
//         {
//           imageUrl: "/images/products/samsung-980pro-3.jpg",
//           isMain: false,
//           alt: "Samsung 980 PRO packaging",
//         },
//       ],
//     },
//     {
//       name: "WD_BLACK SN850X",
//       brand: "Western Digital",
//       description:
//         "The WD_BLACK SN850X is Western Digital's premium gaming SSD, designed to eliminate storage bottlenecks in high-performance gaming rigs. With sequential read speeds up to 7,300 MB/s, it offers lightning-fast game loads and level transitions. The proprietary WD_BLACK G2 controller and cutting-edge memory technology work together to deliver predictive loading, reducing in-game stutter and lag spikes that can impact gaming performance. The optional heatsink model provides improved thermal management to maintain peak speeds during extended gaming sessions, making it compatible with PlayStation 5 consoles as well as desktop PCs. Game Mode 2.0 in the WD_BLACK Dashboard software optimizes the drive specifically for gaming workloads, while nCache 4.0 technology enhances write speeds during intensive tasks. With capacities up to 4TB, the SN850X provides ample space for extensive game libraries, and the M.2 2280 form factor ensures broad compatibility with modern motherboards and laptops.",
//       shortDescription:
//         "Gaming-optimized PCIe 4.0 NVMe SSD with speeds up to 7,300 MB/s",
//       basePrice: 209.99,
//       isActive: true,
//       isNewProduct: true,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [categories["Internal SSD"]._id, categories["Storage"]._id],
//       tags: ["storage", "ssd", "nvme", "wd", "gaming", "pcie4", "m.2"],
//       variants: [
//         {
//           name: "1TB",
//           sku: "WD-SN850X-1TB",
//           attributes: {
//             capacity: "1TB",
//             interface: "PCIe 4.0 x4, NVMe 1.4",
//             readSpeed: "7,300 MB/s",
//             writeSpeed: "6,300 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "600 TB",
//           },
//           price: 209.99,
//           salePrice: 179.99,
//           inventory: 40,
//           isActive: true,
//         },
//         {
//           name: "2TB",
//           sku: "WD-SN850X-2TB",
//           attributes: {
//             capacity: "2TB",
//             interface: "PCIe 4.0 x4, NVMe 1.4",
//             readSpeed: "7,300 MB/s",
//             writeSpeed: "6,600 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "1,200 TB",
//           },
//           price: 379.99,
//           salePrice: 329.99,
//           inventory: 25,
//           isActive: true,
//         },
//         {
//           name: "4TB",
//           sku: "WD-SN850X-4TB",
//           attributes: {
//             capacity: "4TB",
//             interface: "PCIe 4.0 x4, NVMe 1.4",
//             readSpeed: "7,300 MB/s",
//             writeSpeed: "6,600 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "2,400 TB",
//           },
//           price: 699.99,
//           salePrice: null,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/wd-sn850x-1.jpg",
//           isMain: true,
//           alt: "WD_BLACK SN850X front view",
//         },
//         {
//           imageUrl: "/images/products/wd-sn850x-2.jpg",
//           isMain: false,
//           alt: "WD_BLACK SN850X with heatsink",
//         },
//         {
//           imageUrl: "/images/products/wd-sn850x-3.jpg",
//           isMain: false,
//           alt: "WD_BLACK SN850X packaging",
//         },
//       ],
//     },
//     {
//       name: "Crucial P5 Plus",
//       brand: "Crucial",
//       description:
//         "The Crucial P5 Plus strikes an excellent balance between performance and value, offering PCIe 4.0 speeds at a competitive price point. With sequential read speeds up to 6,600 MB/s and writes up to 5,000 MB/s, it significantly outperforms PCIe 3.0 drives without breaking the bank. Crucial's proprietary controller and advanced 3D NAND technology deliver reliable performance for everyday productivity, content creation, and gaming workloads. The drive's dynamic write acceleration technology maintains consistent performance during large file transfers, while adaptive thermal protection adjusts performance parameters to prevent overheating under sustained loads. Micron's extensive in-house SSD testing ensures exceptional reliability, backed by a 5-year limited warranty. The included Crucial Storage Executive software allows for easy drive monitoring, performance optimization, and firmware updates, while hardware encryption capabilities protect sensitive data. With its M.2 2280 form factor, the P5 Plus is compatible with both PCIe 4.0 systems (at full speed) and PCIe 3.0 systems (at backward-compatible speeds).",
//       shortDescription:
//         "Value-oriented PCIe 4.0 NVMe SSD with speeds up to 6,600 MB/s",
//       basePrice: 169.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: false,
//       categoryIds: [categories["Internal SSD"]._id, categories["Storage"]._id],
//       tags: ["storage", "ssd", "nvme", "crucial", "pcie4", "m.2", "value"],
//       variants: [
//         {
//           name: "500GB",
//           sku: "CRUCIAL-P5P-500",
//           attributes: {
//             capacity: "500GB",
//             interface: "PCIe 4.0 x4, NVMe",
//             readSpeed: "6,600 MB/s",
//             writeSpeed: "4,000 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "300 TB",
//           },
//           price: 169.99,
//           salePrice: 149.99,
//           inventory: 45,
//           isActive: true,
//         },
//         {
//           name: "1TB",
//           sku: "CRUCIAL-P5P-1TB",
//           attributes: {
//             capacity: "1TB",
//             interface: "PCIe 4.0 x4, NVMe",
//             readSpeed: "6,600 MB/s",
//             writeSpeed: "5,000 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "600 TB",
//           },
//           price: 279.99,
//           salePrice: 239.99,
//           inventory: 35,
//           isActive: true,
//         },
//         {
//           name: "2TB",
//           sku: "CRUCIAL-P5P-2TB",
//           attributes: {
//             capacity: "2TB",
//             interface: "PCIe 4.0 x4, NVMe",
//             readSpeed: "6,600 MB/s",
//             writeSpeed: "5,000 MB/s",
//             formFactor: "M.2 2280",
//             tbw: "1,200 TB",
//           },
//           price: 499.99,
//           salePrice: 429.99,
//           inventory: 20,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/crucial-p5plus-1.jpg",
//           isMain: true,
//           alt: "Crucial P5 Plus front view",
//         },
//         {
//           imageUrl: "/images/products/crucial-p5plus-2.jpg",
//           isMain: false,
//           alt: "Crucial P5 Plus angle view",
//         },
//         {
//           imageUrl: "/images/products/crucial-p5plus-3.jpg",
//           isMain: false,
//           alt: "Crucial P5 Plus packaging",
//         },
//       ],
//     },

//     // INTERNAL HDD - 3 products
//     {
//       name: "Seagate BarraCuda",
//       brand: "Seagate",
//       description:
//         "The Seagate BarraCuda is the industry standard for reliable, cost-effective storage, offering exceptional value for everyday computing and mass storage needs. Available in capacities up to 8TB in the 3.5-inch form factor, it provides ample space for operating systems, applications, documents, and media files. With 7200 RPM spindle speed and 256MB cache on higher-capacity models, it delivers better performance than typical 5400 RPM drives for faster system responsiveness. Seagate's Multi-Tier Caching Technology (MTC) combines several cache types including DRAM and NAND flash to optimize data flow, resulting in improved overall performance for frequently accessed files. With 30+ years of innovation and reliability testing, BarraCuda drives are built to last, backed by Seagate's 2-year limited warranty. The standard SATA 6Gb/s interface ensures broad compatibility with virtually all desktop systems, making it an ideal choice for system builders, storage upgrades, and secondary storage needs where capacity and value take priority over the speed of SSDs.",
//       shortDescription:
//         "Reliable, high-capacity hard drive for everyday computing and storage",
//       basePrice: 59.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: true,
//       isFeatured: true,
//       categoryIds: [categories["Internal HDD"]._id, categories["Storage"]._id],
//       tags: ["storage", "hdd", "seagate", "barracuda", "sata", "desktop"],
//       variants: [
//         {
//           name: "2TB",
//           sku: "SEAGATE-BARRACUDA-2TB",
//           attributes: {
//             capacity: "2TB",
//             interface: "SATA 6Gb/s",
//             formFactor: "3.5-inch",
//             rpm: "7200 RPM",
//             cache: "256MB",
//             recordingTechnology: "CMR",
//           },
//           price: 59.99,
//           salePrice: 54.99,
//           inventory: 50,
//           isActive: true,
//         },
//         {
//           name: "4TB",
//           sku: "SEAGATE-BARRACUDA-4TB",
//           attributes: {
//             capacity: "4TB",
//             interface: "SATA 6Gb/s",
//             formFactor: "3.5-inch",
//             rpm: "7200 RPM",
//             cache: "256MB",
//             recordingTechnology: "CMR",
//           },
//           price: 99.99,
//           salePrice: 89.99,
//           inventory: 40,
//           isActive: true,
//         },
//         {
//           name: "8TB",
//           sku: "SEAGATE-BARRACUDA-8TB",
//           attributes: {
//             capacity: "8TB",
//             interface: "SATA 6Gb/s",
//             formFactor: "3.5-inch",
//             rpm: "7200 RPM",
//             cache: "256MB",
//             recordingTechnology: "CMR",
//           },
//           price: 179.99,
//           salePrice: 159.99,
//           inventory: 25,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/seagate-barracuda-1.jpg",
//           isMain: true,
//           alt: "Seagate BarraCuda front view",
//         },
//         {
//           imageUrl: "/images/products/seagate-barracuda-2.jpg",
//           isMain: false,
//           alt: "Seagate BarraCuda side view",
//         },
//         {
//           imageUrl: "/images/products/seagate-barracuda-3.jpg",
//           isMain: false,
//           alt: "Seagate BarraCuda packaging",
//         },
//       ],
//     },
//     {
//       name: "WD Red Plus",
//       brand: "Western Digital",
//       description:
//         "The WD Red Plus series is specifically designed for NAS (Network Attached Storage) systems, offering reliability and performance optimized for 24/7 operation in multi-drive environments. These drives feature CMR (Conventional Magnetic Recording) technology, preferred by NAS manufacturers for its consistent performance and reliability in RAID configurations. WD's NASware 3.0 technology enhances compatibility with leading NAS systems, improves reliability through error recovery controls, and reduces drive vibration impact in multi-bay enclosures. With capacities up to 14TB, these drives provide ample storage for centralized data storage, backup solutions, and media libraries. The 5400 RPM spindle speed balances performance and power consumption, reducing heat generation and power usage in always-on NAS environments. 3D Active Balance Plus technology provides enhanced drive stability, while advanced error recovery helps maintain data integrity. With a workload rate of up to 180TB per year and MTBF (Mean Time Between Failures) of up to 1 million hours, WD Red Plus drives deliver enterprise-grade reliability for home and small business NAS systems.",
//       shortDescription:
//         "CMR-based NAS hard drives optimized for 24/7 operation in multi-bay systems",
//       basePrice: 84.99,
//       isActive: true,
//       isNewProduct: false,
//       isBestSeller: false,
//       isFeatured: true,
//       categoryIds: [categories["Internal HDD"]._id, categories["Storage"]._id],
//       tags: ["storage", "hdd", "wd", "red", "nas", "cmr", "24/7"],
//       variants: [
//         {
//           name: "4TB",
//           sku: "WD-RED-PLUS-4TB",
//           attributes: {
//             capacity: "4TB",
//             interface: "SATA 6Gb/s",
//             formFactor: "3.5-inch",
//             rpm: "5400 RPM",
//             cache: "128MB",
//             recordingTechnology: "CMR",
//             nasOptimized: "Yes, 1-8 bay",
//           },
//           price: 84.99,
//           salePrice: 79.99,
//           inventory: 35,
//           isActive: true,
//         },
//         {
//           name: "8TB",
//           sku: "WD-RED-PLUS-8TB",
//           attributes: {
//             capacity: "8TB",
//             interface: "SATA 6Gb/s",
//             formFactor: "3.5-inch",
//             rpm: "5400 RPM",
//             cache: "256MB",
//             recordingTechnology: "CMR",
//             nasOptimized: "Yes, 1-8 bay",
//           },
//           price: 169.99,
//           salePrice: 159.99,
//           inventory: 25,
//           isActive: true,
//         },
//         {
//           name: "12TB",
//           sku: "WD-RED-PLUS-12TB",
//           attributes: {
//             capacity: "12TB",
//             interface: "SATA 6Gb/s",
//             formFactor: "3.5-inch",
//             rpm: "5400 RPM",
//             cache: "256MB",
//             recordingTechnology: "CMR",
//             nasOptimized: "Yes, 1-8 bay",
//           },
//           price: 249.99,
//           salePrice: 229.99,
//           inventory: 15,
//           isActive: true,
//         },
//       ],
//       images: [
//         {
//           imageUrl: "/images/products/wd-red-plus-1.jpg",
//           isMain: true,
//           alt: "WD Red Plus front view",
//         },
//         {
//           imageUrl: "/images/products/wd-red-plus-2.jpg",
//           isMain: false,
//           alt: "WD Red Plus in NAS enclosure",
//         },
//         {
//           imageUrl: "/images/products/wd-red-plus-3.jpg",
//           isMain: false,
//           alt: "WD Red Plus packaging",
//         },
//       ],
//     },
//   ];

//   // Create products, variants, and images
//   for (const product of products) {
//     // Extract variants and images
//     const { variants, images, categoryIds, tags, ...productData } = product;

//     // Create product
//     const newProduct = new Product({
//       ...productData,
//       categories: categoryIds,
//       tags,
//     });
//     await newProduct.save();

//     // Create variants
//     for (const variant of variants) {
//       const newVariant = new ProductVariant({
//         ...variant,
//         productId: newProduct._id,
//       });
//       await newVariant.save();
//     }

//     // Create images
//     for (const image of images) {
//       const newImage = new ProductImage({
//         ...image,
//         productId: newProduct._id,
//       });
//       await newImage.save();
//     }
//   }

//   console.log("Products created successfully");
// };

// // Main seeding function
// export const seedDatabase = async () => {
//   try {
//     console.log("Checking if database needs seeding...");

//     // Check if data already exists
//     const dataExists = await checkDataExists();

//     if (dataExists) {
//       console.log("Database already contains data, skipping seeding");
//       return;
//     }

//     console.log("Starting database seeding...");

//     // Seed admin user
//     await seedAdminUser();

//     // Seed categories
//     const categories = await seedCategories();

//     // Seed products
//     await seedProducts(categories);

//     console.log("Database seeding completed successfully");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   }
// };

// export default seedDatabase;
