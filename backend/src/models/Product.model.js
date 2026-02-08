/**
 * Product Model
 * Mongoose schema for product data
 */

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    chemicalname: {
      type: String,
      required: [true, "Chemical name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Cement",
        "Adhesive",
        "Waterproofing",
        "Coating",
        "Sealant",
        "Primer",
        "Concrete Admixture",
        "Repair Material",
        "Grout",
        "Other",
      ],
      default: "Other",
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    hsnCode: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    unit: {
      type: String,
      enum: ["kg", "liter", "bag", "piece", "box", "sqm", "meter"],
      default: "kg",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
      default: 0,
    },
    minOrderQuantity: {
      type: Number,
      min: 0,
      default: 1,
    },
    currency: {
      type: String,
      default: "INR",
    },
    manufacturer: {
      type: String,
      trim: true,
      default: "",
    },
    specifications: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ chemicalname: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
