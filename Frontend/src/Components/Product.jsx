import React, { useState } from "react";

const resolveImage = (raw) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3802";
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f3f4f6' /><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='18'>No Image</text></svg>`,
  )}`;
  if (!raw) return placeholder;
  if (typeof raw !== "string") return placeholder;

  // If it's a placeholder.com URL, return local placeholder instead
  if (raw.includes("placeholder.com")) return placeholder;

  // Already absolute
  if (/^https?:\/\//i.test(raw) || /^\/\//.test(raw)) return encodeURI(raw);

  // Leading slash -> API host + path
  if (raw.startsWith("/")) return encodeURI(`${base}${raw}`);

  // Otherwise treat as relative path on API
  return encodeURI(`${base}/${raw}`);
};

const Product = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(product?.minOrderQuantity || 1);
  const priceDisplay = `₹${product?.price}/${product?.unit || "kg"}`;
  const imgRaw = product?.image || null;
  const imgSrc = resolveImage(imgRaw);

  const handleIncrement = () => {
    console.log("Increment clicked, current quantity:", quantity);
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    console.log("Decrement clicked, current quantity:", quantity);
    const newQuantity = Math.max(product?.minOrderQuantity || 1, quantity - 1);
    setQuantity(newQuantity);
  };

  const handleQuantityChange = (e) => {
    console.log("Quantity input changed:", e.target.value);
    const val = parseInt(e.target.value) || product?.minOrderQuantity || 1;
    setQuantity(Math.max(product?.minOrderQuantity || 1, val));
  };

  const handleAddToCart = () => {
    console.log("Add to Cart clicked", { product, quantity });
    if (onAddToCart) {
      onAddToCart(product, quantity);
      console.log("Product added to cart successfully");
    } else {
      console.error("onAddToCart function not provided");
    }
  };

  return (
    <div className="product-card group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={imgSrc}
          alt={product?.chemicalname}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-linear-to-r from-red-600 to-red-500 rounded-full shadow-md">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-14">
          {product?.chemicalname}
        </h3>

        {/* Brand */}
        {product?.manufacturer && (
          <div className="flex items-center gap-2 mb-3">
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
            <span className="text-sm text-gray-600 font-medium">
              {product.manufacturer}
            </span>
          </div>
        )}

        {/* Description */}
        {product?.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-10">
            {product.description}
          </p>
        )}

        {/* SKU */}
        {product?.sku && (
          <div className="flex items-center gap-2 mb-4">
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
            <span className="text-xs text-gray-500">SKU: {product.sku}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100">
          <span className="text-2xl font-bold text-red-600">
            {priceDisplay.split("/")[0]}
          </span>
          <span className="text-sm text-gray-500">
            /{product?.unit || "kg"}
          </span>
        </div>

        {/* Quantity Selector & Add to Cart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quantity</span>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white active:scale-95 transition-all text-gray-600 hover:text-red-600 font-semibold"
              >
                −
              </button>
              <input
                type="number"
                min={product?.minOrderQuantity || 1}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-14 px-2 py-1 text-center font-semibold bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white active:scale-95 transition-all text-gray-600 hover:text-red-600 font-semibold"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-primary w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg active:scale-98 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
