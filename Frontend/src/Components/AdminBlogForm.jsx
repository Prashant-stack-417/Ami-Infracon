import React, { useState, useEffect } from "react";
import { IconArrowLeft, IconUpload, IconDeviceFloppy } from "@tabler/icons-react";
import apiClient from "../utils/apiClient";
import { toast } from "react-hot-toast";

const AdminBlogForm = ({ blogToEdit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    isPublished: false,
    seoTitle: "",
    seoDescription: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (blogToEdit) {
      setFormData({
        title: blogToEdit.title || "",
        slug: blogToEdit.slug || "",
        content: blogToEdit.content || "",
        tags: blogToEdit.tags ? blogToEdit.tags.join(", ") : "",
        isPublished: blogToEdit.isPublished || false,
        seoTitle: blogToEdit.seoMeta?.title || "",
        seoDescription: blogToEdit.seoMeta?.description || "",
      });
      if (blogToEdit.coverImage) {
        setImagePreview(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${blogToEdit.coverImage}`);
      }
    }
  }, [blogToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Title, Slug, and Content are required");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("slug", formData.slug);
      submitData.append("content", formData.content);
      submitData.append("isPublished", formData.isPublished);
      
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      submitData.append("tags", JSON.stringify(tagsArray));
      
      const seoMeta = {
        title: formData.seoTitle,
        description: formData.seoDescription
      };
      submitData.append("seoMeta", JSON.stringify(seoMeta));

      if (imageFile) {
        submitData.append("coverImage", imageFile);
      }

      if (blogToEdit) {
        const { data } = await apiClient.put(`/blogs/${blogToEdit._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          toast.success("Blog updated successfully");
          onClose();
        }
      } else {
        const { data } = await apiClient.post("/blogs", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data.success) {
          toast.success("Blog created successfully");
          onClose();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onClose}
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <IconArrowLeft size={18} className="mr-1" /> Back to Blogs
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {blogToEdit ? "Edit Blog Post" : "Create New Blog Post"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={!blogToEdit ? generateSlug : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="Enter blog title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="enter-blog-slug"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="e.g. Construction, Concrete, Tips"
                />
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900 font-medium">
                  Publish this post immediately
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(""); }}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                      >
                        <IconArrowLeft size={14} className="rotate-45" /> {/* Use as X mark */}
                      </button>
                    </div>
                  ) : (
                    <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center mt-4">
                    <label
                      htmlFor="cover-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content (HTML) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported) *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-mono text-sm"
              placeholder="<p>Write your content here...</p>"
              required
            />
          </div>

          {/* SEO Meta */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
            <h3 className="text-md font-semibold text-gray-800">SEO Meta Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="Defaults to post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <input
                  type="text"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="Short description for search engines"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg flex items-center font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <IconDeviceFloppy size={20} className="mr-2" />
                  Save Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogForm;
