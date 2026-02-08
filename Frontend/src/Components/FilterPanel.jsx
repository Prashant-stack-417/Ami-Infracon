import React from "react";

const FilterPanel = ({
  priceRange,
  setPriceRange,
  selectedCategory,
  setSelectedCategory,
}) => {
  const categories = [
    "All",
    "Cement",
    "Adhesive",
    "Waterproofing",
    "Coating",
    "Sealant",
    "Primer",
    "Concrete Admixture",
    "Repair Material",
    "Grout",
    "Other",
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Category Filter */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="min-price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Min Price (₹)
          </label>
          <input
            id="min-price"
            type="number"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange({ ...priceRange, min: e.target.value })
            }
            placeholder="Min"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="max-price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Max Price (₹)
          </label>
          <input
            id="max-price"
            type="number"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
            placeholder="Max"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
