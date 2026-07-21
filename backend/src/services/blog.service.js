import Blog from "../models/Blog.model.js";
import { ApiError } from "../utils/apiError.js";

class BlogService {
  async getAllBlogs() {
    return await Blog.find({ isPublished: true })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
  }

  async getBlogBySlug(slug) {
    const blog = await Blog.findOne({ slug, isPublished: true }).populate(
      "author",
      "name email"
    );

    if (!blog) {
      throw new ApiError(404, "Blog not found or not published");
    }

    return blog;
  }

  async getAdminBlogs() {
    return await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
  }

  async createBlog(data, authorId) {
    const { title, slug, content, tags, isPublished, seoMeta, coverImage } = data;

    if (!title || !slug || !content) {
      throw new ApiError(400, "Title, slug, and content are required");
    }

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      throw new ApiError(400, "Blog with this slug already exists");
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      coverImage: coverImage || "",
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      isPublished: isPublished === "true" || isPublished === true,
      seoMeta: seoMeta ? (typeof seoMeta === 'string' ? JSON.parse(seoMeta) : seoMeta) : { title: "", description: "" },
      author: authorId, 
    });

    return blog;
  }

  async updateBlog(id, data) {
    const { title, slug, content, tags, isPublished, seoMeta, coverImage } = data;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }

    // Handle slug update conflict
    if (slug && slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        throw new ApiError(400, "Another blog with this slug already exists");
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

    if (coverImage !== undefined) {
      blog.coverImage = coverImage;
    }

    return await blog.save();
  }

  async deleteBlog(id) {
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }

    return blog;
  }
}

export const blogService = new BlogService();
