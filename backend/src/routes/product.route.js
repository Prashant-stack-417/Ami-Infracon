import { Router } from "express";
import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
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


const router = Router();

// Cloudinary storage for images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ami-infracon/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
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
router.route("/").post(verifyAdminToken, createProduct);

/**
 * @route POST /api/products/upload
 * Private - admin can upload product image
 */
router
  .route("/upload")
  .post(
    verifyAdminToken,
    upload.single("image"),
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
router.route("/:id").put(verifyAdminToken, updateProduct);

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
