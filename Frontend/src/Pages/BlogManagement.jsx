import React, { useState, useEffect } from "react";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from "@tabler/icons-react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import AdminBlogForm from "../Components/AdminBlogForm";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/blogs/admin/all");
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const { data } = await axiosInstance.delete(`/blogs/${id}`);
      if (data.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBlog(null);
    fetchBlogs();
  };

  if (showForm) {
    return <AdminBlogForm blogToEdit={editingBlog} onClose={handleCloseForm} />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your knowledge base articles</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
        >
          <IconPlus size={20} className="mr-2" />
          Create Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No blog posts found. Create one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{blog.title}</td>
                    <td className="p-4">
                      {blog.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <IconEye size={12} className="mr-1" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <IconEyeOff size={12} className="mr-1" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <IconTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
