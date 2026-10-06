import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getProducts,
  getProductById,
  createProduct,
  uploadProductImage,
  deleteProductImage,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  getRelatedProducts,
} from "../controllers/product.controller.js";
import { verifyAdminToken } from "../middleware/auth.middleware.js";
import { validateProduct, validateProductUpdate } from "../middleware/validate.middleware.js";


const router = Router();

// Local disk storage for product images
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/** Image magic-byte signatures (first bytes of supported formats) */
const IMAGE_MAGIC = [
  [0xff, 0xd8, 0xff],               // JPEG
  [0x89, 0x50, 0x4e, 0x47],         // PNG
  [0x52, 0x49, 0x46, 0x46],         // WEBP (RIFF....WEBP)
];

/**
 * Reads the first 12 bytes of a file and checks against known image magic bytes.
 * Returns true if the file content matches an image format.
 */
const isImageByMagicBytes = async (filePath) => {
  const fd = await fs.promises.open(filePath, "r");
  try {
    const buf = Buffer.alloc(12);
    await fd.read(buf, 0, 12, 0);
    return IMAGE_MAGIC.some((sig) => sig.every((byte, i) => buf[i] === byte));
  } finally {
    await fd.close();
  }
};

/**
 * Multer post-upload middleware that verifies magic bytes.
 * Deletes the file and returns 400 if it's not a real image.
 */
const verifyImageMagicBytes = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const ok = await isImageByMagicBytes(req.file.path);
    if (!ok) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: "Invalid image file: content does not match an image format" });
    }
    next();
  } catch {
    await fs.promises.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ success: false, message: "Failed to validate uploaded file" });
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".webp"];
    if (/^image\//.test(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image uploads with valid extensions (.png, .jpg, .jpeg, .webp) are allowed"));
    }
  },
});

/**
 * @route GET /api/products
 * Public - list available products
 */
router.route("/").get(getProducts);

/**
 * @route GET /api/products/:id
 * Public - get single product by ID
 */
router.route("/:id").get(getProductById);

/**
 * @route POST /api/products
 * Private - admin/superadmin can add products
 */
router.route("/").post(verifyAdminToken, validateProduct, createProduct);

/**
 * @route POST /api/products/upload
 * Private - admin can upload product image
 */
router
  .route("/upload")
  .post(
    verifyAdminToken,
    upload.single("image"),
    verifyImageMagicBytes,  // content check after disk write
    uploadProductImage,
  );

/**
 * @route DELETE /api/products/upload/:filename
 * Private - admin can delete uploaded image file
 */
router
  .route("/upload/:filename")
  .delete(verifyAdminToken, deleteProductImage);

/**
 * @route PUT /api/products/:id
 * Private - admin can update product
 */
router.route("/:id").put(verifyAdminToken, validateProductUpdate, updateProduct);

/**
 * @route DELETE /api/products/:id
 * Private - admin can delete product
 */
router.route("/:id").delete(verifyAdminToken, deleteProduct);

// Multer instance for CSV bulk upload (stored in memory)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB CSV max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) cb(null, true);
    else cb(new Error("Only CSV files are allowed"));
  },
});

/**
 * @route POST /api/products/bulk
 * Private - admin can bulk create products from CSV
 */
router.route("/bulk").post(verifyAdminToken, csvUpload.single("csv"), bulkCreateProducts);

/**
 * @route GET /api/products/:id/related
 * Public - get related products
 */
router.route("/:id/related").get(getRelatedProducts);

export default router;
