// models/productImage.model.js
import { Schema, model } from "mongoose";

const ProductImageSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    alt: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ProductImageSchema.index({ productId: 1 });
ProductImageSchema.index({ variantId: 1 });

// Ensure only one main image per product
ProductImageSchema.pre("save", async function (next) {
  if (this.isMain) {
    try {
      const query = {
        productId: this.productId,
        _id: { $ne: this._id },
        isMain: true,
      };

      if (this.variantId) {
        query.variantId = this.variantId;
      }

      await this.constructor.updateMany(query, { $set: { isMain: false } });
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default model("ProductImage", ProductImageSchema);
