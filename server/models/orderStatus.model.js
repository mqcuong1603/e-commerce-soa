// models/orderStatus.model.js
import { Schema, model } from "mongoose";

const OrderStatusSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipping",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    note: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
OrderStatusSchema.index({ orderId: 1 });
OrderStatusSchema.index({ orderId: 1, createdAt: -1 });

// Ensure the timestamp is updated for each status change
OrderStatusSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default model("OrderStatus", OrderStatusSchema);
