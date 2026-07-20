import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IconArrowLeft, IconCalendar, IconUser, IconShare } from "@tabler/icons-react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import DOMPurify from "dompurify";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/blogs/${slug}`);
      if (data.success) {
        setBlog(data.data);
        if (data.data.seoMeta?.title) {
          document.title = `${data.data.seoMeta.title} | Ami Infracon`;
        } else {
          document.title = `${data.data.title} | Ami Infracon`;
        }
      }
    } catch (error) {
      toast.error("Article not found");
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <Link to="/blogs" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 font-medium">
          <IconArrowLeft size={16} className="mr-2" />
          Back to all articles
        </Link>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex gap-2 mb-6">
            {blog.tags.map((tag, idx) => (
              <span key={idx} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {blog.title}
        </h1>

        <div className="flex items-center justify-between border-b border-gray-200 pb-8">
          <div className="flex items-center space-x-6 text-gray-500">
            <div className="flex items-center">
              <IconCalendar size={18} className="mr-2 text-gray-400" />
              {new Date(blog.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {blog.author && (
              <div className="flex items-center">
                <IconUser size={18} className="mr-2 text-gray-400" />
                {blog.author.name}
              </div>
            )}
          </div>
          <button 
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
            title="Share article"
          >
            <IconShare size={20} />
          </button>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${blog.coverImage}`}
            alt={blog.title}
            className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl shadow-lg"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 prose prose-lg prose-amber">
        {/* We sanitize HTML from the rich text editor to prevent Stored XSS */}
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} />
      </article>
    </div>
  );
};

export default BlogDetail;
