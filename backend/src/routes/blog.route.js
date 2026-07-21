import { Router } from "express";
import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import {
  getAllBlogs,
  getBlogBySlug,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { verifyAdminToken } from "../middleware/auth.middleware.js";

const router = Router();

// Cloudinary storage for blogs
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ami-infracon/blogs",
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

// Admin routes first to prevent /:slug from catching /admin/all
router.route("/admin/all").get(verifyAdminToken, getAdminBlogs);

// Public routes
router.route("/").get(getAllBlogs);
router.route("/:slug").get(getBlogBySlug);

// Admin mutations
router.route("/").post(verifyAdminToken, upload.single("coverImage"), createBlog);
router.route("/:id").put(verifyAdminToken, upload.single("coverImage"), updateBlog).delete(verifyAdminToken, deleteBlog);

export default router;
