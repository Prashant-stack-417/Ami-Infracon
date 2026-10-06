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
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Valid phone number is required (e.g. +911234567890)").optional(),
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
});

export const validateRegister = validateRequest(registerSchema);
export const validateAdminRegister = validateRequest(adminRegisterSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateOrder = validateRequest(orderSchema);

