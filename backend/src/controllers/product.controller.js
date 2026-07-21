/**
 * Product Controller
 * Simple handlers to list products
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { productService } from "../services/product.service.js";

/**
 * GET /api/products
 * Returns a list of active products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const MAX_LIMIT = 100;
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = (isNaN(rawLimit) || rawLimit <= 0) ? MAX_LIMIT : Math.min(rawLimit, MAX_LIMIT);
  
  const result = await productService.getProducts(page, limit);
  return res.status(200).json(new ApiResponse(200, result, "Products retrieved"));
});

/**
 * GET /api/products/:id
 * Returns a single product by ID
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  return res.status(200).json(new ApiResponse(200, { product }, "Product retrieved"));
});

/**
 * POST /api/products
 * Create a new product (admin/superadmin)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res.status(201).json(new ApiResponse(201, { product }, "Product created"));
});

/**
 * POST /api/products/upload
 * Accepts multipart/form-data with `image` file. Returns the public URL.
 */
export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }
  const host = req.get("host");
  const proto = req.protocol;

  const result = await productService.uploadProductImage(req.file, host, proto);
  return res.status(201).json(new ApiResponse(201, result, "Image uploaded"));
});

/**
 * DELETE /api/products/upload/:filename
 * Remove an uploaded file from disk
 */
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  if (!filename) throw new ApiError(400, "Filename required");

  await productService.deleteProductImage(filename);
  return res.status(200).json(new ApiResponse(200, null, "Image deleted"));
});

/**
 * PUT /api/products/:id
 * Update an existing product (admin/superadmin)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.updateProduct(id, req.body);
  return res.status(200).json(new ApiResponse(200, { product }, "Product updated"));
});

/**
 * DELETE /api/products/:id
 * Delete a product (admin/superadmin)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await productService.deleteProduct(id);
  return res.status(200).json(new ApiResponse(200, null, "Product deleted"));
});

/**
 * POST /api/products/bulk
 * Bulk create products from a CSV file (admin/superadmin)
 * Expected CSV columns: chemicalname, description, category, sku, hsnCode, price, unit, quantity, minOrderQuantity, manufacturer, specifications
 */
export const bulkCreateProducts = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No CSV file uploaded");
  }

  const result = await productService.bulkCreateProducts(req.file.path);
  return res.status(201).json(new ApiResponse(201, result, `Bulk upload complete: ${result.inserted} products created, ${result.skipped} skipped`));
});

/**
 * GET /api/products/:id/related
 * Public - get related products
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const relatedProducts = await productService.getRelatedProducts(id);
  return res.status(200).json(new ApiResponse(200, { products: relatedProducts }, "Related products retrieved"));
});
