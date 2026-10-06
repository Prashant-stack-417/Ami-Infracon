/**
 * Validation Middleware
 * Provides request validation for various endpoints
 * Normalizes email to lowercase for case-insensitive matching
 * @module middleware/validate
 */

import { z } from "zod";

const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    // Overwrite req.body with the parsed (and possibly transformed) data
    req.body = parsed;
    next();
  } catch (error) {
    if (error.name === "ZodError") {
      const errors = error.issues ? error.issues.map(err => err.message) : error.errors?.map(err => err.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors || [] });
    }
    next(error);
  }
};

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Valid email address is required").transform(e => e.toLowerCase().trim()),
  password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Valid phone number is required (e.g. +911234567890)"),
  coordinates: z.tuple([z.number(), z.number()]).optional().refine(val => {
    if (!val) return true;
    return val.length === 2;
  }, "Coordinates must be an array of [longitude, latitude]")
});

const adminRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Valid email address is required").transform(e => e.toLowerCase().trim()),
  password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.string({ required_error: "Valid email address is required", invalid_type_error: "Valid email address is required" }).email("Valid email address is required").transform(e => e.toLowerCase().trim()),
  password: z.string({ required_error: "Password is required", invalid_type_error: "Password is required" }).min(1, "Password is required"),
});

const orderSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be a positive number"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
});

const productCategoryEnum = z.enum([
  "Cement", "Adhesive", "Waterproofing", "Coating", "Sealant", 
  "Primer", "Concrete Admixture", "Repair Material", "Grout", "Other"
]);

const productUnitEnum = z.enum(["kg", "liter", "bag", "piece", "box", "sqm", "meter"]);

const productSchema = z.object({
  chemicalname: z.string().min(1, "Chemical name is required"),
  description: z.string().optional(),
  category: productCategoryEnum.optional(),
  sku: z.string().optional(),
  hsnCode: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  unit: productUnitEnum.optional(),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  minOrderQuantity: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  currency: z.string().optional(),
  manufacturer: z.string().optional(),
  specifications: z.string().optional(),
  isActive: z.boolean().optional(),
}).strict();

const productUpdateSchema = productSchema.partial();

const parseJson = (val) => {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
};

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  tags: z.preprocess(parseJson, z.array(z.string()).optional()),
  seoMeta: z.preprocess(parseJson, z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).strict().optional()),
  status: z.enum(["draft", "published", "archived"]).optional(),
}).strict();

const blogUpdateSchema = blogSchema.partial();

const adminUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  email: z.string().email("Valid email address is required").optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
  isActive: z.boolean().optional(),
}).strict();

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      quantity: z.number().positive("Quantity must be a positive number"),
    }).strict()
  ).min(1, "At least one item is required"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  description: z.string().max(1000).optional(),
}).strict();

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Valid phone number is required (e.g. +911234567890)").optional(),
  defaultAddress: z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).strict().optional(),
}).strict();

export const validateRegister = validateRequest(registerSchema);
export const validateAdminRegister = validateRequest(adminRegisterSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateOrder = validateRequest(orderSchema);
export const validateProduct = validateRequest(productSchema);
export const validateProductUpdate = validateRequest(productUpdateSchema);
export const validateBlog = validateRequest(blogSchema);
export const validateBlogUpdate = validateRequest(blogUpdateSchema);
export const validateAdminUpdate = validateRequest(adminUpdateSchema);
export const validateCheckout = validateRequest(checkoutSchema);
export const validateProfileUpdate = validateRequest(profileUpdateSchema);
