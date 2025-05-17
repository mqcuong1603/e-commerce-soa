// models/product.model.js
import { Schema, model } from "mongoose";
import slugify from "slugify";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [100, "Description must be at least 100 characters long"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewProduct: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name
ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });

    // Ensure slug is unique by adding timestamp if needed
    this.constructor
      .findOne({ slug: this.slug, _id: { $ne: this._id } })
      .then((existingProduct) => {
        if (existingProduct) {
          this.slug = `${this.slug}-${Date.now().toString().slice(-4)}`;
        }
        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});

// Virtual for product variants
ProductSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "productId",
});

// Virtual for product images
ProductSchema.virtual("images", {
  ref: "ProductImage",
  localField: "_id",
  foreignField: "productId",
});

// Virtual for product reviews
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

// Update average rating and review count
ProductSchema.methods.updateRating = async function () {
  const Review = model("Review");
  // Count of all reviews
  const totalReviews = await Review.countDocuments({ productId: this._id });

  // Calculate average but only consider reviews with ratings > 0
  const stats = await Review.aggregate([
    {
      $match: {
        productId: this._id,
        rating: { $gt: 0 }, // Only include reviews with ratings (exclude guest comments)
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    // We have reviews with ratings
    this.averageRating = Math.round(stats[0].avgRating * 10) / 10; // Round to 1 decimal place
    this.ratingCount = stats[0].ratingCount; // Number of reviews with ratings
  } else {
    // No reviews with ratings
    this.averageRating = 0;
    this.ratingCount = 0;
  }

  // Total number of reviews (including those without ratings, i.e., guest comments)
  this.reviewCount = totalReviews;

  return this.save();
};

export default model("Product", ProductSchema);
