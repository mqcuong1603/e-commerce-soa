// models/review.model.js
import { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });

// A user can only leave one review per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true, sparse: true });

// Update product rating after saving a review
ReviewSchema.post("save", async function () {
  try {
    const Product = model("Product");
    const product = await Product.findById(this.productId);

    if (product) {
      await product.updateRating();
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
});

// Update product rating after updating or removing a review
ReviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    try {
      const Product = model("Product");
      const product = await Product.findById(doc.productId);

      if (product) {
        await product.updateRating();
      }
    } catch (error) {
      console.error("Error updating product rating:", error);
    }
  }
});

ReviewSchema.post("remove", async function () {
  try {
    const Product = model("Product");
    const product = await Product.findById(this.productId);

    if (product) {
      await product.updateRating();
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
});

export default model("Review", ReviewSchema);
