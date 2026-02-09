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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 overflow-hidden">
      <div className="p-4 flex items-start space-x-4">
        <img
          src={imgSrc}
          alt={product?.chemicalname}
          className="w-24 h-24 object-cover rounded-md shrink-0"
          onError={(e) => {
            // Fallback to an inline SVG data URI if external placeholder fails
            e.currentTarget.onerror = null;
            e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(
              `
                <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
                  <rect width='100%' height='100%' fill='%23f3f4f6' />
                  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='18'>No Image</text>
                </svg>
              `,
            )}`;
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">
            {product?.chemicalname}
          </h3>
          {product?.category && (
            <div className="text-xs text-gray-600 mt-1 inline-block px-2 py-0.5 bg-gray-100 rounded">
              {product.category}
            </div>
          )}
          {product?.description && (
            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </div>
          )}
          {product?.sku && (
            <div className="text-xs text-gray-600 mt-1">SKU: {product.sku}</div>
          )}
          {product?.manufacturer && (
            <div className="text-xs text-gray-600 mt-1">
              Brand: {product.manufacturer}
            </div>
          )}
          <div className="mt-2 font-bold text-primary">{priceDisplay}</div>
        </div>
        <div className="shrink-0 ml-2 flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setQuantity(
                  Math.max(product?.minOrderQuantity || 1, quantity - 1),
                )
              }
              className="px-2 py-1 border rounded hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              min={product?.minOrderQuantity || 1}
              value={quantity}
              onChange={(e) => {
                const val =
                  parseInt(e.target.value) || product?.minOrderQuantity || 1;
                setQuantity(Math.max(product?.minOrderQuantity || 1, val));
              }}
              className="w-16 px-2 py-1 border rounded text-center"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2 py-1 border rounded hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="btn-primary px-3 py-1 rounded hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-1 w-full"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
