import React from "react";

const resolveImage = (raw) => {
  const base = import.meta.env.VITE_API_BASE_URL;
  const placeholder = `https://via.placeholder.com/200x200?text=${encodeURIComponent("Product")}`;
  if (!raw) return placeholder;
  if (typeof raw !== "string") return placeholder;

  // Already absolute
  if (/^https?:\/\//i.test(raw) || /^\/\//.test(raw)) return encodeURI(raw);

  // Leading slash -> API host + path
  if (raw.startsWith("/")) return encodeURI(`${base}${raw}`);

  // If placeholder host without protocol
  if (raw.includes("placeholder.com") && !/^https?:\/\//i.test(raw))
    return encodeURI(`https://${raw}`);

  // Otherwise treat as relative path on API
  return encodeURI(`${base}/${raw}`);
};

const Product = ({ product, onAddToCart }) => {
  const priceDisplay = product?.currency
    ? `${product.currency} ${product.price}`
    : product?.price;
  const imgRaw = product?.thumbnail || product?.image || null;
  const imgSrc = resolveImage(imgRaw);

  return (
    <div className="product-card bg-white rounded-lg shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5 overflow-hidden">
      <div className="p-4 flex items-start space-x-4">
        <img
          src={imgSrc}
          alt={product?.name}
          className="w-24 h-24 object-cover rounded-md shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">{product?.name}</h3>
          <p className="text-sm text-gray-500 max-h-14 overflow-hidden">
            {product?.description}
          </p>
          <div className="mt-2 font-bold">{priceDisplay}</div>
        </div>
        <div className="shrink-0 ml-2">
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="btn-primary px-3 py-1 rounded hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
