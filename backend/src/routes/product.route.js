import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getProducts,
  createProduct,
  uploadProductImage,
  deleteProductImage,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { verifyAdminToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image uploads are allowed"));
  },
});

/**
 * @route GET /api/products
 * Public - list available products
 */
router.route("/").get(asyncHandler(getProducts));

/**
 * @route POST /api/products
 * Private - admin/superadmin can add products
 */
router.route("/").post(verifyAdminToken, asyncHandler(createProduct));

/**
 * @route POST /api/products/upload
 * Private - admin can upload product image
 */
router
  .route("/upload")
  .post(
    verifyAdminToken,
    upload.single("image"),
    asyncHandler(uploadProductImage),
  );

/**
 * @route DELETE /api/products/upload/:filename
 * Private - admin can delete uploaded image file
 */
router
  .route("/upload/:filename")
  .delete(verifyAdminToken, asyncHandler(deleteProductImage));

/**
 * @route PUT /api/products/:id
 * Private - admin can update product
 */
router.route("/:id").put(verifyAdminToken, asyncHandler(updateProduct));

/**
 * @route DELETE /api/products/:id
 * Private - admin can delete product
 */
router.route("/:id").delete(verifyAdminToken, asyncHandler(deleteProduct));

export default router;
