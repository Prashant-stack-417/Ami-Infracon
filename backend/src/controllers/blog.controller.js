import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { blogService } from "../services/blog.service.js";

// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.getAllBlogs();
  res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const blog = await blogService.getBlogBySlug(slug);
  res.status(200).json(new ApiResponse(200, blog, "Blog fetched successfully"));
});

// @desc    Get all blogs (including unpublished)
// @route   GET /api/blogs/admin/all
// @access  Admin
export const getAdminBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.getAdminBlogs();
  res.status(200).json(new ApiResponse(200, blogs, "All blogs fetched successfully"));
});

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Admin
export const createBlog = asyncHandler(async (req, res) => {
  // Assuming multer is configured to upload files to req.file, but we'll stick to a simple URL string if provided via body, or file if uploaded.
  let coverImage = "";
  if (req.file) {
    // In this app, uploaded files are in public/uploads and stored as URL path
    coverImage = `/uploads/${req.file.filename}`;
  } else if (req.body.coverImage) {
    coverImage = req.body.coverImage;
  }

  const data = { ...req.body, coverImage };
  const authorId = req.admin.id; // JWT payload uses "id" not "_id"

  const blog = await blogService.createBlog(data, authorId);
  res.status(201).json(new ApiResponse(201, blog, "Blog created successfully"));
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Admin
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let coverImage = undefined;
  if (req.file) {
    coverImage = `/uploads/${req.file.filename}`;
  } else if (req.body.coverImage !== undefined) {
    coverImage = req.body.coverImage;
  }

  const data = { ...req.body };
  if (coverImage !== undefined) {
    data.coverImage = coverImage;
  }

  const updatedBlog = await blogService.updateBlog(id, data);
  res.status(200).json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Admin
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await blogService.deleteBlog(id);
  res.status(200).json(new ApiResponse(200, {}, "Blog deleted successfully"));
});