import Blog from "../models/Blog.model.js";




// @desc    Get all published blogs
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .populate("author", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    { success: true, data: blogs, message: "Blogs fetched successfully" }
  );
};
// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, isPublished: true }).populate(
    "author",
    "name email"
  );

  if (!blog) {
    throw Object.assign(new Error("Blog not found or not published"), { statusCode: 404 });
  }

  res.status(200).json(
    { success: true, data: blog, message: "Blog fetched successfully" }
  );
};
// @desc    Get all blogs (including unpublished)
// @route   GET /api/blogs/admin/all
// @access  Admin
export const getAdminBlogs = async (req, res) => {
  const blogs = await Blog.find()
    .populate("author", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(
    { success: true, data: blogs, message: "All blogs fetched successfully" }
  );
};
// @desc    Create a blog
// @route   POST /api/blogs
// @access  Admin
export const createBlog = async (req, res) => {
  const { title, slug, content, tags, isPublished, seoMeta } = req.body;

  // Assuming multer is configured to upload files to req.file, but we'll stick to a simple URL string if provided via body, or file if uploaded.
  let coverImage = "";
  if (req.file) {
    // In this app, uploaded files are in public/uploads and stored as URL path
    coverImage = `/uploads/${req.file.filename}`;
  } else if (req.body.coverImage) {
    coverImage = req.body.coverImage;
  }

  if (!title || !slug || !content) {
    throw new ApiError(400, "Title, slug, and content are required");
  }

  const existingBlog = await Blog.findOne({ slug });
  if (existingBlog) {
    throw Object.assign(new Error("Blog with this slug already exists"), { statusCode: 400 });
  }

  const blog = await Blog.create({
    title,
    slug,
    content,
    coverImage,
    tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
    isPublished: isPublished === "true" || isPublished === true,
    seoMeta: seoMeta ? (typeof seoMeta === 'string' ? JSON.parse(seoMeta) : seoMeta) : { title: "", description: "" },
    author: req.admin._id, // Assuming AdminProtectedRoute attaches admin object to req
  });

  res.status(201).json(
    { success: true, data: blog, message: "Blog created successfully" }
  );
};
// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Admin
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, slug, content, tags, isPublished, seoMeta } = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw Object.assign(new Error("Blog not found"), { statusCode: 404 });
  }

  // Handle slug update conflict
  if (slug && slug !== blog.slug) {
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      throw Object.assign(new Error("Another blog with this slug already exists"), { statusCode: 400 });
    }
    blog.slug = slug;
  }

  if (title) blog.title = title;
  if (content) blog.content = content;
  if (tags) {
    blog.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
  }
  if (isPublished !== undefined) {
    blog.isPublished = isPublished === "true" || isPublished === true;
  }
  if (seoMeta) {
    blog.seoMeta = typeof seoMeta === 'string' ? JSON.parse(seoMeta) : seoMeta;
  }

  if (req.file) {
    blog.coverImage = `/uploads/${req.file.filename}`;
  } else if (req.body.coverImage !== undefined) {
    blog.coverImage = req.body.coverImage;
  }

  const updatedBlog = await blog.save();

  res.status(200).json(
    { success: true, data: updatedBlog, message: "Blog updated successfully" }
  );
};
// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Admin
export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    throw Object.assign(new Error("Blog not found"), { statusCode: 404 });
  }

  res.status(200).json(
    { success: true, data: {}, message: "Blog deleted successfully" }
  );
};