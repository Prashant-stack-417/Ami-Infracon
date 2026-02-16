import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import useUserStore from "../app/userStore";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import { resolveImage } from "../utils/imageUtils";
import {
  IconShoppingCart,
  IconArrowLeft,
  IconPackage,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const { addToCart, user } = useUserStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products/${id}`);
      
      if (isMounted.current) {
        setProduct(response.data?.data?.product || null);
      }
    } catch (error) {
      if (isMounted.current) {
        handleApiError(error, {
          fallbackMessage: "Failed to load product details",
        });
        // Redirect to home if product not found
        if (error.response?.status === 404) {
          setTimeout(() => navigate("/"), 2000);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, navigate, isMounted]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!product) {
      toast.error("Product information not available");
      return;
    }

    try {
      setAdding(true);
      addToCart(product, quantity);
      toast.success(`Added ${quantity} ${product.chemicalname} to cart`);
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to add to cart",
      });
    } finally {
      if (isMounted.current) {
        setAdding(false);
      }
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center pt-20">
        <div className="text-center">
          <IconPackage size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Product not found</p>
          <Link
            to="/"
            className="text-primary hover:text-primary-dark font-semibold"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <IconArrowLeft size={20} />
          <span>Back to Products</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={resolveImage(product.image)}
                  alt={product.chemicalname}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400?text=No+Image";
                  }}
                />
              </div>
              {product.category && (
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {product.category}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col"
            >
              <h1 className="text-3xl font-bold text-primary-content mb-4">
                {product.chemicalname}
              </h1>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price}
                </span>
                <span className="text-gray-500">/ {product.unit || "unit"}</span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary-content mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Specifications */}
              <div className="mb-6 space-y-3">
                <h3 className="text-lg font-semibold text-primary-content mb-3">
                  Product Information
                </h3>
                
                {product.sku && (
                  <div className="flex items-center gap-2 text-sm">
                    <IconInfoCircle size={18} className="text-gray-400" />
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-semibold text-primary-content">
                      {product.sku}
                    </span>
                  </div>
                )}

                {product.hsnCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <IconInfoCircle size={18} className="text-gray-400" />
                    <span className="text-gray-600">HSN Code:</span>
                    <span className="font-semibold text-primary-content">
                      {product.hsnCode}
                    </span>
                  </div>
                )}

                {product.manufacturer && (
                  <div className="flex items-center gap-2 text-sm">
                    <IconCircleCheck size={18} className="text-green-500" />
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-semibold text-primary-content">
                      {product.manufacturer}
                    </span>
                  </div>
                )}
              </div>

              {product.specifications && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary-content mb-2">
                    Specifications
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.specifications}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary-content mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-6 py-2 font-semibold text-primary-content border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {product.unit || "units"}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg py-4 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <IconShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Info Banner */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For bulk orders or custom requirements,
                  please{" "}
                  <Link
                    to="/contact"
                    className="underline hover:text-blue-900 font-semibold"
                  >
                    contact us
                  </Link>{" "}
                  for special pricing.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Related Products Section (Optional - can be implemented later) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-primary-content mb-6">
            Similar Products
          </h2>
          <p className="text-gray-600">
            Browse our catalog for more construction chemicals and solutions.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
