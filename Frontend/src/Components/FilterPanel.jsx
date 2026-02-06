import React from "react";

const FilterPanel = ({
  categories = [],
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="mb-6">
      <div className="inline-block min-w-50">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="category-select"
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option value={c} key={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
