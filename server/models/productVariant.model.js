// models/productVariant.model.js
import { Schema, model } from "mongoose";

const ProductVariantSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },
    inventory: {
      type: Number,
      required: true,
      min: [0, "Inventory cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
ProductVariantSchema.index({ productId: 1 });
// ProductVariantSchema.index({ sku: 1 });

// Virtual for variant images
ProductVariantSchema.virtual("images", {
  ref: "ProductImage",
  localField: "_id",
  foreignField: "variantId",
});

// Virtual for current price (accounting for sale price if present)
ProductVariantSchema.virtual("currentPrice").get(function () {
  return this.salePrice && this.salePrice < this.price
    ? this.salePrice
    : this.price;
});

// Check if variant is in stock
ProductVariantSchema.virtual("inStock").get(function () {
  return this.inventory > 0;
});

// Methods for inventory management
ProductVariantSchema.methods.decreaseInventory = async function (quantity) {
  if (this.inventory < quantity) {
    throw new Error("Not enough inventory");
  }

  this.inventory -= quantity;
  return this.save();
};

ProductVariantSchema.methods.increaseInventory = async function (quantity) {
  this.inventory += quantity;
  return this.save();
};

export default model("ProductVariant", ProductVariantSchema);
