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



const sizeOfAsync = promisify(sizeOf);

/**
 * GET /api/products
 * Returns a list of active products
 */
export const getProducts = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 0; // 0 means no limit (legacy fallback)
  
  const query = { isActive: true };
  const skip = (page - 1) * limit;

  // Execute query with or without pagination
  const productsQuery = Product.find(query).sort({ createdAt: -1 });
  
  if (limit > 0) {
    productsQuery.skip(skip).limit(limit);
  }
  
  const [products, total] = await Promise.all([
    productsQuery,
    Product.countDocuments(query),
  ]);

  return res.json({
    success: true,
    data: { 
      products,
      pagination: limit > 0 ? {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      } : null
    }, 
    message: "Products retrieved"
  });
};

/**
 * GET /api/products/:id
 * Returns a single product by ID
 */
export const getProductById = async (req, res) => {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  }
  
  return res.json({ success: true, data: { product }, message: "Product retrieved" });
};

/**
 * POST /api/products
 * Create a new product (admin/superadmin)
 */
export const createProduct = async (req, res) => {
  const {
    chemicalname,
    description,
    category,
    sku,
    hsnCode,
    price,
    unit,
    quantity,
    minOrderQuantity,
    currency,
    manufacturer,
    specifications,
    image,
    isActive,
  } = req.body;

  if (
    !chemicalname ||
    typeof chemicalname !== "string" ||
    !chemicalname.trim()
  ) {
    throw Object.assign(new Error("Chemical name is required"), { statusCode: 400 });
  }

  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    throw Object.assign(new Error("Price is required"), { statusCode: 400 });
  }

  const product = await Product.create({
    chemicalname: chemicalname.trim(),
    description: description || "",
    category: category || "Other",
    sku: sku || "",
    hsnCode: hsnCode || "",
    price: Number(price),
    unit: unit || "kg",
    quantity: quantity !== undefined ? Number(quantity) : 0,
    minOrderQuantity:
      minOrderQuantity !== undefined ? Number(minOrderQuantity) : 1,
    currency: currency || "INR",
    manufacturer: manufacturer || "",
    specifications: specifications || "",
    image: image || "",
    isActive: typeof isActive === "boolean" ? isActive : true,
  });

  return res
    .status(201)
    .json({ success: true, data: { product }, message: "Product created" });
};

/**
 * POST /api/products/upload
 * Accepts multipart/form-data with `image` file. Returns the public URL.
 */
export const uploadProductImage = async (req, res) => {
  if (!req.file) {
    throw Object.assign(new Error("No file uploaded"), { statusCode: 400 });
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
    throw Object.assign(new Error("Image too large. Maximum size is 2MB."), { statusCode: 400 });
  }

  // Validate image dimensions
  try {
    const dims = await sizeOfAsync(filePath);
    const maxWidth = 3000;
    const maxHeight = 3000;
    if (dims.width > maxWidth || dims.height > maxHeight) {
      await fs.promises.unlink(filePath).catch(() => {});
      throw Object.assign(new Error(`Image dimensions too large. Max ${maxWidth}x${maxHeight}px.`), { statusCode: 400 });
    }
  } catch (e) {
    // If image-size failed for a reason other than our own ApiError, remove file and error
    await fs.promises.unlink(filePath).catch(() => {});
    if (e instanceof ApiError) throw e;
    throw Object.assign(new Error("Invalid image file"), { statusCode: 400 });
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
    throw Object.assign(new Error("Failed to process image"), { statusCode: 500 });
  }

  // Build public URLs for uploaded file and thumbnail
  const publicPath = `/uploads/${filename}`;
  const publicThumbPath = `/uploads/thumbs/${thumbName}`;
  const host = req.get("host");
  const proto = req.protocol;
  const url = `${proto}://${host}${publicPath}`;
  const thumbUrl = `${proto}://${host}${publicThumbPath}`;

  return res.status(201).json({
    success: true,
    data: { url, path: publicPath, thumbUrl, thumbPath: publicThumbPath },
    message: "Image uploaded"
  });
};

/**
 * DELETE /api/products/upload/:filename
 * Remove an uploaded file from disk
 */
export const deleteProductImage = async (req, res) => {
  const { filename } = req.params;
  if (!filename) throw Object.assign(new Error("Filename required"), { statusCode: 400 });
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
    return res.json({ success: true, data: null, message: "Image deleted" });
  } catch (e) {
    // If file doesn't exist, treat as success (idempotent)
    if (e.code === "ENOENT")
      return res.json({ success: true, data: null, message: "Image deleted" });
    throw Object.assign(new Error("Failed to delete image"), { statusCode: 500 });
  }
};

/**
 * PUT /api/products/:id
 * Update an existing product (admin/superadmin)
 */
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    chemicalname,
    description,
    category,
    sku,
    hsnCode,
    price,
    unit,
    quantity,
    minOrderQuantity,
    currency,
    manufacturer,
    specifications,
    image,
    isActive,
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  }

  // Update fields if provided
  if (chemicalname !== undefined) product.chemicalname = chemicalname.trim();
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (sku !== undefined) product.sku = sku;
  if (hsnCode !== undefined) product.hsnCode = hsnCode;
  if (price !== undefined) product.price = Number(price);
  if (unit !== undefined) product.unit = unit;
  if (quantity !== undefined) product.quantity = Number(quantity);
  if (minOrderQuantity !== undefined)
    product.minOrderQuantity = Number(minOrderQuantity);
  if (currency !== undefined) product.currency = currency;
  if (manufacturer !== undefined) product.manufacturer = manufacturer;
  if (specifications !== undefined) product.specifications = specifications;
  if (image !== undefined) product.image = image;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

  return res.json({ success: true, data: { product }, message: "Product updated" });
};

/**
 * DELETE /api/products/:id
 * Delete a product (admin/superadmin)
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  }

  await Product.findByIdAndDelete(id);

  return res.json({ success: true, data: null, message: "Product deleted" });
};

/**
 * POST /api/products/bulk
 * Bulk create products from a CSV file (admin/superadmin)
 * Expected CSV columns: chemicalname, description, category, sku, hsnCode, price, unit, quantity, minOrderQuantity, manufacturer, specifications
 */
export const bulkCreateProducts = async (req, res) => {

  if (!req.file) {
    throw Object.assign(new Error("No CSV file uploaded"), { statusCode: 400 });
  }

  const filePath = req.file.path;
  const { createReadStream } = await import("fs");
  const csvParser = (await import("csv-parser")).default;

  const products = [];
  const errors = [];

  await new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // Validate required fields
        if (!row.chemicalname?.trim()) {
          errors.push({ row, error: "Missing chemicalname" });
          return;
        }
        if (!row.price || isNaN(Number(row.price))) {
          errors.push({ row, error: "Missing or invalid price" });
          return;
        }

        const validCategories = ["Cement", "Adhesive", "Waterproofing", "Coating", "Sealant", "Primer", "Concrete Admixture", "Repair Material", "Grout", "Other"];
        const validUnits = ["kg", "liter", "bag", "piece", "box", "sqm", "meter"];

        products.push({
          chemicalname: row.chemicalname.trim(),
          description: row.description || "",
          category: validCategories.includes(row.category) ? row.category : "Other",
          sku: row.sku || "",
          hsnCode: row.hsnCode || "",
          price: Number(row.price),
          unit: validUnits.includes(row.unit) ? row.unit : "kg",
          quantity: Number(row.quantity) || 0,
          minOrderQuantity: Number(row.minOrderQuantity) || 1,
          lowStockThreshold: Number(row.lowStockThreshold) || 10,
          manufacturer: row.manufacturer || "",
          specifications: row.specifications || "",
          isActive: true,
        });
      })
      .on("error", reject)
      .on("end", resolve);
  });

  // Clean up temp file
  await fs.promises.unlink(filePath).catch(() => {});

  if (products.length === 0) {
    throw Object.assign(new Error(`No valid products found in CSV. ${errors.length} rows had errors.`), { statusCode: 400 });
  }

  const inserted = await Product.insertMany(products, { ordered: false });

  return res.status(201).json({
    success: true,
    data: {
      inserted: inserted.length,
      skipped: errors.length,
      errors: errors.slice(0, 10)
    },
    message: `Bulk upload complete: ${inserted.length} products created, ${errors.length} skipped`
  });
};

/**
 * GET /api/products/:id/related
 * Public - get related products
 */
export const getRelatedProducts = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .sort({ createdAt: -1 });

  return res.json(
    { success: true, data: { products: relatedProducts }, message: "Related products retrieved" }
  );
};
