import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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

// Local disk storage for blog images
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `blog-${uniqueSuffix}${ext}`);
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

// Middleware to verify magic bytes of uploaded files
const verifyImageBytes = (req, res, next) => {
  if (!req.file) return next();

  const buffer = Buffer.alloc(12);
  try {
    const fd = fs.openSync(req.file.path, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);
    
    const hex = buffer.toString('hex').toUpperCase();
    
    const isJPG = hex.startsWith('FFD8FF');
    const isPNG = hex.startsWith('89504E47');
    const isGIF = hex.startsWith('47494638'); // GIF8
    const isWEBP = hex.startsWith('52494646') && hex.substring(16, 24) === '57454250'; // RIFF....WEBP

    if (!isJPG && !isPNG && !isGIF && !isWEBP) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Invalid file content: Not a valid image." });
    }
    
    next();
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    next(err);
  }
};

// Admin routes first to prevent /:slug from catching /admin/all
router.route("/admin/all").get(verifyAdminToken, getAdminBlogs);

// Public routes
router.route("/").get(getAllBlogs);
router.route("/:slug").get(getBlogBySlug);

// Admin mutations
router.route("/").post(verifyAdminToken, upload.single("coverImage"), verifyImageBytes, createBlog);
router.route("/:id").put(verifyAdminToken, upload.single("coverImage"), verifyImageBytes, updateBlog).delete(verifyAdminToken, deleteBlog);

export default router;
