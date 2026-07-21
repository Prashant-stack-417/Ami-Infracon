import fs from "fs";
import path from "path";
import { promisify } from "util";
import sizeOf from "image-size";
import sharp from "sharp";
import Product from "../models/Product.model.js";
import { ApiError } from "../utils/apiError.js";

const sizeOfAsync = promisify(sizeOf);

class ProductService {
  async getProducts(page = 1, limit = 100) {
    const query = { isActive: true };
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: limit > 0 ? {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      } : null
    };
  }

  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return product;
  }

  async createProduct(data) {
    const {
      chemicalname, description, category, sku, hsnCode, price, unit,
      quantity, minOrderQuantity, currency, manufacturer, specifications, image, isActive,
    } = data;

    if (!chemicalname || typeof chemicalname !== "string" || !chemicalname.trim()) {
      throw new ApiError(400, "Chemical name is required");
    }

    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      throw new ApiError(400, "Price is required");
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
      minOrderQuantity: minOrderQuantity !== undefined ? Number(minOrderQuantity) : 1,
      currency: currency || "INR",
      manufacturer: manufacturer || "",
      specifications: specifications || "",
      image: image || "",
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return product;
  }

  async uploadProductImage(file, host, proto) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const filename = file.filename;
    const filePath = path.join(uploadsDir, filename);

    // Validate file size
    const stats = await fs.promises.stat(filePath);
    const maxBytes = 2 * 1024 * 1024; // 2 MB
    if (stats.size > maxBytes) {
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
        throw new ApiError(400, `Image dimensions too large. Max ${maxWidth}x${maxHeight}px.`);
      }
    } catch (e) {
      await fs.promises.unlink(filePath).catch(() => {});
      if (e instanceof ApiError) throw e;
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
      await fs.promises.unlink(filePath).catch(() => {});
      throw new ApiError(500, "Failed to process image");
    }

    const publicPath = `/uploads/${filename}`;
    const publicThumbPath = `/uploads/thumbs/${thumbName}`;
    const url = `${proto}://${host}${publicPath}`;
    const thumbUrl = `${proto}://${host}${publicThumbPath}`;

    return { url, path: publicPath, thumbUrl, thumbPath: publicThumbPath };
  }

  async deleteProductImage(filename) {
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeName);
    const thumbPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "thumbs",
      `thumb-${safeName}`
    );
    try {
      await fs.promises.unlink(filePath).catch(() => {});
      await fs.promises.unlink(thumbPath).catch(() => {});
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw new ApiError(500, "Failed to delete image");
      }
    }
  }

  async updateProduct(id, data) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const {
      chemicalname, description, category, sku, hsnCode, price, unit,
      quantity, minOrderQuantity, currency, manufacturer, specifications, image, isActive,
    } = data;

    if (chemicalname !== undefined) product.chemicalname = chemicalname.trim();
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (sku !== undefined) product.sku = sku;
    if (hsnCode !== undefined) product.hsnCode = hsnCode;
    if (price !== undefined) product.price = Number(price);
    if (unit !== undefined) product.unit = unit;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (minOrderQuantity !== undefined) product.minOrderQuantity = Number(minOrderQuantity);
    if (currency !== undefined) product.currency = currency;
    if (manufacturer !== undefined) product.manufacturer = manufacturer;
    if (specifications !== undefined) product.specifications = specifications;
    if (image !== undefined) product.image = image;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    await Product.findByIdAndDelete(id);
  }

  async bulkCreateProducts(fileBuffer) {
    const { Readable } = await import("stream");
    const csvParser = (await import("csv-parser")).default;

    const products = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      Readable.from(fileBuffer)
        .pipe(csvParser())
        .on("data", (row) => {
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

    if (products.length === 0) {
      throw new ApiError(400, `No valid products found in CSV. ${errors.length} rows had errors.`);
    }

    const inserted = await Product.insertMany(products, { ordered: false });

    return {
      inserted: inserted.length,
      skipped: errors.length,
      errors: errors.slice(0, 10)
    };
  }

  async getRelatedProducts(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .sort({ createdAt: -1 });

    return relatedProducts;
  }
}

export const productService = new ProductService();
