import React from "react";

const FilterPanel = ({
  products,
  selectedBrand,
  setSelectedBrand,
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

  // Extract unique brands from products
  const brands = [
    "All",
    ...new Set(products.map((p) => p.manufacturer).filter(Boolean)),
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

      {/* Brand Filter */}
      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Brand/Manufacturer
        </label>
        <select
          id="brand"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
