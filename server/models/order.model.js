// models/order.model.js
import { Schema, model } from "mongoose";
import { randomBytes } from "crypto";

const OrderItemSchema = new Schema({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  variantName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const AddressSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        {
          validator: function (items) {
            return items.length > 0;
          },
          message: "Order must contain at least one item",
        },
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    shippingFee: {
      type: Number,
      required: true,
      min: [0, "Shipping fee cannot be negative"],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, "Tax cannot be negative"],
    },
    discountCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
      min: [0, "Loyalty points used cannot be negative"],
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    loyaltyPointsAwarded: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "paypal", "credit_card"], // Example payment methods
      default: "cod",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate a unique order number before saving
OrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    // Format: ORD-YYYYMMDD-XXXX where XXXX is a random alphanumeric string
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = randomBytes(2).toString("hex").toUpperCase();
    this.orderNumber = `ORD-${date}-${randomStr}`;
  }
  next();
});

// Index for faster queries (removed duplicate orderNumber index)
OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });

// Calculate loyalty points (10% of total)
OrderSchema.methods.calculateLoyaltyPoints = function () {
  // Round down to nearest whole number
  this.loyaltyPointsEarned = Math.floor(this.total * 0.1);
  return this.loyaltyPointsEarned;
};

// Virtual for order status (derived from latest order status record)
OrderSchema.virtual("status", {
  ref: "OrderStatus",
  localField: "_id",
  foreignField: "orderId",
  options: { sort: { createdAt: -1 }, limit: 1 },
});

// Virtual for all status history
OrderSchema.virtual("statusHistory", {
  ref: "OrderStatus",
  localField: "_id",
  foreignField: "orderId",
  options: { sort: { createdAt: -1 } },
});

export default model("Order", OrderSchema);
