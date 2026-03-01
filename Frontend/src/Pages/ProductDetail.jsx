import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import anime from "animejs";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import useUserStore from "../app/userStore";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import { resolveImage } from "../utils/imageUtils";
import useAnimeCartFx from "../hooks/useAnimeCartFx";
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
  const { playAddBounce } = useAnimeCartFx();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Refs for anime.js
  const root = useRef(null);
  const scope = useRef(null);
  const addBtnRef = useRef(null);
  const qtyDisplayRef = useRef(null);

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

  // Animate content in when product loads
  useEffect(() => {
    if (!product || !root.current) return;

    // Timeline for orchestrated entrance
    const tl = anime.timeline({
      easing: "easeOutQuart",
    });

    // 1. Main container fade-in + scale
    tl.add({
      targets: ".pd-container",
      opacity: [0, 1],
      scale: [0.98, 1],
      duration: 600,
    })
      // 2. Image slide in from left with spring
      .add({
        targets: ".pd-image-wrap",
        opacity: [0, 1],
        translateX: [-80, 0],
        rotate: [-3, 0],
        duration: 800,
        easing: "easeOutElastic(1, .6)",
      }, "-=400")
      // 3. Image parallax zoom
      .add({
        targets: ".pd-image",
        scale: [1.15, 1],
        duration: 1200,
        easing: "easeOutQuart",
      }, "-=600")
      // 4. Category badge pop-in
      .add({
        targets: ".pd-badge",
        opacity: [0, 1],
        scale: [0, 1],
        rotate: [-10, 0],
        duration: 500,
        easing: "easeOutElastic(1, .8)",
      }, "-=800")
      // 5. Title type effect
      .add({
        targets: ".pd-title",
        opacity: [0, 1],
        translateX: [40, 0],
        duration: 700,
        easing: "easeOutCubic",
      }, "-=600")
      // 6. Price counter animation
      .add({
        targets: ".pd-price",
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.9, 1],
        duration: 500,
        easing: "easeOutElastic(1, .8)",
      }, "-=400")
      // 7. Info items stagger
      .add({
        targets: ".pd-info-item",
        opacity: [0, 1],
        translateX: [30, 0],
        duration: 500,
        delay: anime.stagger(80),
        easing: "easeOutCubic",
      }, "-=300")
      // 8. Quantity selector fade-in
      .add({
        targets: ".pd-qty-selector",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic",
      }, "-=200")
      // 9. Add to cart button special entrance
      .add({
        targets: ".pd-add-btn",
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.95, 1],
        duration: 600,
        easing: "easeOutElastic(1, .8)",
      }, "-=300")
      // 10. Info banner slide up
      .add({
        targets: ".pd-info-banner",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: "easeOutCubic",
      }, "-=300")
      // 11. Related section
      .add({
        targets: ".pd-related",
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 700,
        easing: "easeOutCubic",
      }, "-=200");

    // Back button float animation (subtle looping)
    anime({
      targets: ".pd-back-link",
      translateX: [0, -5, 0],
      duration: 2000,
      loop: true,
      easing: "easeInOutSine",
      delay: 1500,
    });

  }, [product]);

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

      // Play anime.js spring bounce
      playAddBounce(addBtnRef.current);

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
    // Micro-animation on quantity display
    if (qtyDisplayRef.current) {
      anime({
        targets: qtyDisplayRef.current,
        scale: [1, 1.2, 1],
        duration: 300,
        easing: "easeOutElastic(1, .8)",
      });
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    if (qtyDisplayRef.current) {
      anime({
        targets: qtyDisplayRef.current,
        scale: [1, 0.85, 1],
        duration: 300,
        easing: "easeOutElastic(1, .8)",
      });
    }
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
    <div
      ref={root}
      className="min-h-screen bg-linear-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="pd-back-link inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <IconArrowLeft size={20} />
          <span>Back to Products</span>
        </Link>

        <div className="pd-container bg-white rounded-2xl shadow-xl overflow-hidden opacity-0">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="pd-image-wrap relative opacity-0">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={resolveImage(product.image)}
                  alt={product.chemicalname}
                  className="pd-image w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400?text=No+Image";
                  }}
                />
              </div>
              {product.category && (
                <div className="pd-badge absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold opacity-0">
                  {product.category}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="pd-title text-3xl font-bold text-primary-content mb-4 opacity-0">
                {product.chemicalname}
              </h1>

              <div className="pd-price flex items-baseline gap-2 mb-6 opacity-0">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price}
                </span>
                <span className="text-gray-500">/ {product.unit || "unit"}</span>
              </div>

              {product.description && (
                <div className="pd-info-item mb-6 opacity-0">
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
                <h3 className="pd-info-item text-lg font-semibold text-primary-content mb-3 opacity-0">
                  Product Information
                </h3>

                {product.sku && (
                  <div className="pd-info-item flex items-center gap-2 text-sm opacity-0">
                    <IconInfoCircle size={18} className="text-gray-400" />
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-semibold text-primary-content">
                      {product.sku}
                    </span>
                  </div>
                )}

                {product.hsnCode && (
                  <div className="pd-info-item flex items-center gap-2 text-sm opacity-0">
                    <IconInfoCircle size={18} className="text-gray-400" />
                    <span className="text-gray-600">HSN Code:</span>
                    <span className="font-semibold text-primary-content">
                      {product.hsnCode}
                    </span>
                  </div>
                )}

                {product.manufacturer && (
                  <div className="pd-info-item flex items-center gap-2 text-sm opacity-0">
                    <IconCircleCheck size={18} className="text-green-500" />
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-semibold text-primary-content">
                      {product.manufacturer}
                    </span>
                  </div>
                )}
              </div>

              {product.specifications && (
                <div className="pd-info-item mb-6 opacity-0">
                  <h3 className="text-lg font-semibold text-primary-content mb-2">
                    Specifications
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.specifications}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="pd-qty-selector mb-6 opacity-0">
                <label className="block text-sm font-medium text-primary-content mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span
                      ref={qtyDisplayRef}
                      className="px-6 py-2 font-semibold text-primary-content border-x border-gray-300"
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors active:scale-95"
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
                ref={addBtnRef}
                onClick={handleAddToCart}
                disabled={adding}
                className="pd-add-btn w-full bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg py-4 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 opacity-0"
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
              <div className="pd-info-banner mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg opacity-0">
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
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="pd-related mt-12 opacity-0">
          <h2 className="text-2xl font-bold text-primary-content mb-6">
            Similar Products
          </h2>
          <p className="text-gray-600">
            Browse our catalog for more construction chemicals and solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
