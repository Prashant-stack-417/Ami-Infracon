import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Author (Admin ID) is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    seoMeta: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ isPublished: 1 });
blogSchema.index({ tags: 1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
