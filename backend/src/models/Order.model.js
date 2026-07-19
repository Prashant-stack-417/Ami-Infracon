/**
 * Order Model
 * Mongoose schema for order
 * @module models/Order
 */

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        negotiatedPrice: {
          type: Number,
          required: true,
          min: 0,
        }
      }
    ],
    type: {
      type: String,
      enum: ["standard_order", "quotation_request"],
      default: "standard_order",
    },
    paymentTerms: {
      type: String,
      enum: ["upfront", "net_30"],
      default: "upfront",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "quote_requested", "quote_approved", "processing", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        comment: { type: String }
      }
    ]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Virtual for order age in days
orderSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if order can be modified
orderSchema.methods.canBeModified = function () {
  return this.status === "pending" || this.status === "processing";
};

// Method to check if order can be cancelled/deleted
orderSchema.methods.canBeCancelled = function () {
  return this.status !== "completed";
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
