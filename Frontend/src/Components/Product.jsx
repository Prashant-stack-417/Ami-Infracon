import { useState, useMemo, useCallback, useRef, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import anime from "animejs";
import { resolveImage } from "../utils/imageUtils";
import toast from "react-hot-toast";
import useAnimeCartFx from "../hooks/useAnimeCartFx";

/**
 * Product Card Component — with anime.js scroll-reveal + add-to-cart animation
 */
const Product = memo(({ product, onAddToCart, index = 0 }) => {
  const [quantity, setQuantity] = useState(product?.minOrderQuantity || 1);
  const cardRef = useRef(null);
  const addBtnRef = useRef(null);
  const imageRef = useRef(null);
  const scope = useRef(null);
  const { playAddBounce } = useAnimeCartFx();

  // Scroll-triggered reveal animation
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = "translateY(50px) scale(0.95)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Card entrance: staggered by index
          anime({
            targets: el,
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.95, 1],
            rotate: [2, 0],
            duration: 800,
            delay: (index % 4) * 120, // stagger within visible row
            easing: "easeOutElastic(1, .8)",
          });

          // Image subtle zoom-in
          if (imageRef.current) {
            anime({
              targets: imageRef.current,
              scale: [1.1, 1],
              duration: 1200,
              delay: (index % 4) * 120 + 200,
              easing: "easeOutQuart",
            });
          }

          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [index]);

  // Memoize computed values
  const priceDisplay = useMemo(
    () => `₹${product?.price}/${product?.unit || "kg"}`,
    [product?.price, product?.unit],
  );

  const imgSrc = useMemo(
    () => resolveImage(product?.image || null),
    [product?.image],
  );

  // Memoize event handlers
  const handleIncrement = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setQuantity((prev) =>
      Math.max(product?.minOrderQuantity || 1, prev - 1),
    );
  }, [product?.minOrderQuantity]);

  const handleQuantityChange = useCallback(
    (e) => {
      const val = parseInt(e.target.value) || product?.minOrderQuantity || 1;
      setQuantity(Math.max(product?.minOrderQuantity || 1, val));
    },
    [product?.minOrderQuantity],
  );

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(product, quantity);

      // Play anime.js spring bounce on the Add button
      playAddBounce(addBtnRef.current);

      toast.success(
        `${quantity} ${product?.unit || "item"}(s) of ${product?.chemicalname} added to cart`,
      );
    }
  }, [onAddToCart, product, quantity, playAddBounce]);

  // Hover tilt effect
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    anime({
      targets: card,
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      duration: 600,
      easing: "easeOutElastic(1, .8)",
    });
  }, []);

  return (
    <article
      ref={cardRef}
      className="product-card group bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
      aria-label={`Product: ${product?.chemicalname}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          ref={imageRef}
          src={imgSrc}
          alt={`${product?.chemicalname} - ${product?.category || "Product"} by ${product?.manufacturer || "Unknown manufacturer"}`}
          className="w-full h-full object-cover transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f3f4f6' /><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='18'>No Image</text></svg>`,
            )}`;
          }}
        />
        {/* Category Badge */}
        {product?.category && (
          <div className="absolute top-3 left-3">
            <span
              className="type-overline inline-block px-3 py-1 text-white bg-linear-to-r from-red-600 to-red-500 rounded-full shadow-md"
              role="text"
              aria-label={`Category: ${product.category}`}
            >
              {product.category}
            </span>
          </div>
        )}
        {/* Hover Overlay */}
        <div className="product-overlay pointer-events-none group-hover:pointer-events-auto">
          <Link
            to={`/product/${product?._id}`}
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl hover:bg-primary hover:text-white transition-all duration-200 active:scale-95"
            aria-label={`View details for ${product?.chemicalname}`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick View
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="type-subtitle text-gray-900 mb-phi-xs line-clamp-2 min-h-14">
          {product?.chemicalname}
        </h3>

        {/* Brand */}
        {product?.manufacturer && (
          <div className="flex items-center gap-2 mb-phi-xs">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="type-caption text-gray-600 font-medium">
              {product.manufacturer}
            </span>
          </div>
        )}

        {/* Description */}
        {product?.description && (
          <p className="type-caption text-gray-500 mb-phi-xs line-clamp-2 min-h-10">
            {product.description}
          </p>
        )}

        {/* SKU */}
        {product?.sku && (
          <div className="flex items-center gap-2 mb-phi-sm">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            <span className="type-overline text-gray-500">SKU: {product.sku}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-phi-sm pb-4 border-b border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="type-price text-red-600">
              {priceDisplay.split("/")[0]}
            </span>
            <span className="type-caption text-gray-500">
              /{product?.unit || "kg"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            In Stock
          </span>
        </div>

        {/* Quantity Selector & Add to Cart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="type-label text-gray-700">Quantity</span>
            <div
              className="flex items-center gap-2 bg-gray-50 rounded-lg p-1"
              role="group"
              aria-label="Quantity controls"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white active:scale-95 transition-all text-gray-600 hover:text-red-600 font-semibold"
                aria-label="Decrease quantity"
                title="Decrease quantity"
              >
                −
              </button>
              <label htmlFor={`quantity-${product?._id}`} className="sr-only">
                Quantity for {product?.chemicalname}
              </label>
              <input
                id={`quantity-${product?._id}`}
                type="number"
                min={product?.minOrderQuantity || 1}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-14 px-2 py-1 text-center type-label font-semibold bg-transparent focus:outline-none"
                aria-label={`Quantity for ${product?.chemicalname}`}
              />
              <button
                type="button"
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white active:scale-95 transition-all text-gray-600 hover:text-red-600 font-semibold"
                aria-label="Increase quantity"
                title="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/product/${product?._id}`}
              className="flex-1 px-4 py-3 rounded-lg type-label font-semibold text-center border-2 border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 transition-colors"
              aria-label={`View details for ${product?.chemicalname}`}
            >
              View Details
            </Link>
            <button
              ref={addBtnRef}
              type="button"
              onClick={handleAddToCart}
              className="flex-1 btn-primary px-4 py-3 rounded-lg type-label font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              aria-label={`Add ${quantity} ${product?.unit || "item"}(s) of ${product?.chemicalname} to cart`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

Product.displayName = "Product";

export default Product;
