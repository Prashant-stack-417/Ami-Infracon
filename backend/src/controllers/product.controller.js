/**
 * Product Controller
 * Simple handlers to list products
 */

import path from "path";
import fs from "fs";
import { promisify } from "util";
import sizeOf from "image-size";
import sharp from "sharp";
import Product from "../models/Product.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const sizeOfAsync = promisify(sizeOf);

/**
 * GET /api/products
 * Returns a list of active products
 */
export const getProducts = async (req, res) => {
  const products = await Product.find({ isActive: true }).sort({
    createdAt: -1,
  });
  return res.json(new ApiResponse(200, { products }, "Products retrieved"));
};

/**
 * POST /api/products
 * Create a new product (admin/superadmin)
 */
export const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    currency,
    sku,
    image,
    thumbnail,
    isActive,
  } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Product name is required");
  }

  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    throw new ApiError(400, "Product price is required");
  }

  const product = await Product.create({
    name: name.trim(),
    description: description || "",
    price: Number(price),
    currency: currency || "INR",
    sku: sku || "",
    image: image || "",
    thumbnail: thumbnail || "",
    isActive: typeof isActive === "boolean" ? isActive : true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { product }, "Product created"));
};

/**
 * POST /api/products/upload
 * Accepts multipart/form-data with `image` file. Returns the public URL.
 */
export const uploadProductImage = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filename = req.file.filename;
  const filePath = path.join(uploadsDir, filename);

  // Validate file size (multer may enforce this, but re-check defensively)
  const stats = await fs.promises.stat(filePath);
  const maxBytes = 2 * 1024 * 1024; // 2 MB
  if (stats.size > maxBytes) {
    // remove file
    await fs.promises.unlink(filePath).catch(() => {});
    throw new ApiError(400, "Image too large. Maximum size is 2MB.");
  }

  // Validate image dimensions
  try {
    const dims = await sizeOfAsync(filePath);
    const maxWidth = 3000;
    const maxHeight = 3000;
    if (dims.width > maxWidth || dims.height > maxHeight) {
      await fs.promises.unlink(filePath).catch(() => {});
      throw new ApiError(
        400,
        `Image dimensions too large. Max ${maxWidth}x${maxHeight}px.`,
      );
    }
  } catch (e) {
    // If image-size failed, remove file and error
    await fs.promises.unlink(filePath).catch(() => {});
    throw new ApiError(400, "Invalid image file");
  }

  // create thumbnail
  const thumbsDir = path.join(uploadsDir, "thumbs");
  if (!fs.existsSync(thumbsDir)) {
    await fs.promises.mkdir(thumbsDir, { recursive: true });
  }

  const thumbName = `thumb-${filename}`;
  const thumbPath = path.join(thumbsDir, thumbName);
  try {
    await sharp(filePath).resize(320, 320, { fit: "inside" }).toFile(thumbPath);
  } catch (e) {
    // If sharp fails, remove uploaded file and rethrow
    await fs.promises.unlink(filePath).catch(() => {});
    throw new ApiError(500, "Failed to process image");
  }

  // Build public URLs for uploaded file and thumbnail
  const publicPath = `/uploads/${filename}`;
  const publicThumbPath = `/uploads/thumbs/${thumbName}`;
  const host = req.get("host");
  const proto = req.protocol;
  const url = `${proto}://${host}${publicPath}`;
  const thumbUrl = `${proto}://${host}${publicThumbPath}`;

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { url, path: publicPath, thumbUrl, thumbPath: publicThumbPath },
        "Image uploaded",
      ),
    );
};

/**
 * DELETE /api/products/upload/:filename
 * Remove an uploaded file from disk
 */
export const deleteProductImage = async (req, res) => {
  const { filename } = req.params;
  if (!filename) throw new ApiError(400, "Filename required");
  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  const thumbPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "thumbs",
    `thumb-${filename}`,
  );
  try {
    await fs.promises.unlink(filePath).catch(() => {});
    await fs.promises.unlink(thumbPath).catch(() => {});
    return res.json(new ApiResponse(200, null, "Image deleted"));
  } catch (e) {
    // If file doesn't exist, treat as success (idempotent)
    if (e.code === "ENOENT")
      return res.json(new ApiResponse(200, null, "Image deleted"));
    throw new ApiError(500, "Failed to delete image");
  }
};
