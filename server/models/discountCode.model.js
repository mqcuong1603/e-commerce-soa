// models/discountCode.model.js
import { Schema, model } from "mongoose";

const DiscountCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [5, "Code must be exactly 5 characters long"],
      maxlength: [5, "Code must be exactly 5 characters long"],
      match: [
        /^[A-Z0-9]{5}$/,
        "Code must contain only alphanumeric characters",
      ],
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value cannot be negative"],
    },
    usageLimit: {
      type: Number,
      required: true,
      min: [1, "Usage limit must be at least 1"],
      max: [10, "Usage limit cannot exceed 10"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Virtual for remaining uses
DiscountCodeSchema.virtual("remainingUses").get(function () {
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for usage percentage
DiscountCodeSchema.virtual("usagePercentage").get(function () {
  return (this.usedCount / this.usageLimit) * 100;
});

// Virtual for discount code validity
DiscountCodeSchema.virtual("isValid").get(function () {
  return this.isActive && this.usedCount < this.usageLimit;
});

// Calculate discount amount based on cart total
DiscountCodeSchema.methods.calculateDiscount = function (total) {
  if (!this.isValid) {
    return 0;
  }

  if (this.discountType === "percentage") {
    // Cap percentage discount at 100%
    const percentValue = Math.min(this.discountValue, 100);
    return (total * percentValue) / 100;
  } else {
    // Fixed amount discount cannot exceed total
    return Math.min(this.discountValue, total);
  }
};

// Increment used count
DiscountCodeSchema.methods.use = async function () {
  if (!this.isValid) {
    throw new Error("Discount code is no longer valid");
  }

  this.usedCount += 1;

  // Automatically deactivate if limit reached
  if (this.usedCount >= this.usageLimit) {
    this.isActive = false;
  }

  return this.save();
};

export default model("DiscountCode", DiscountCodeSchema);
