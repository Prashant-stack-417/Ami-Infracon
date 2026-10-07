import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconArrowRight, IconCalendar, IconUser } from "@tabler/icons-react";
import apiClient from "../utils/apiClient";
import { toast } from "react-hot-toast";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/blogs");
      if (data.success) {
        setBlogs(data.data);
      }
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Knowledge Base
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Insights, tutorials, and updates from Ami Infracon.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-2xl shadow-sm">
            <p className="text-lg">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {blog.coverImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${blog.coverImage}`}
                    alt={blog.title}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/eeeeee/999999?text=Ami+Infracon'; }}
                  />
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <span className="text-amber-600 font-semibold text-lg">{blog.title.charAt(0)}</span>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <IconCalendar size={16} className="mr-1" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                    {blog.author && (
                      <div className="flex items-center">
                        <IconUser size={16} className="mr-1" />
                        {blog.author.name}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-amber-600 transition-colors">
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto mb-4">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="mt-auto inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 group"
                  >
                    Read article
                    <IconArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
