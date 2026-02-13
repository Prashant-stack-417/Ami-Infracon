import React, { useEffect, useState } from "react";
import Hero from "../Components/HomeComponents/Hero";
import Footer from "../Components/HomeComponents/Footer";
import Product from "../Components/Product";
import SearchBar from "../Components/SearchBar";
import FilterPanel from "../Components/FilterPanel";
import Cart from "../Components/Cart";
import AdminProductForm from "../Components/AdminProductForm";
import useUserStore from "../app/userStore";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const addToCart = useUserStore((s) => s.addToCart);
  const cart = useUserStore((s) => s.cart);
  const user = useUserStore((s) => s.user);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Fetch products (exposed so admin form can refresh)
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3802/api/products");
      if (!res.ok) return;
      const body = await res.json();
      const productsList = body?.data?.products || [];
      setProducts(productsList);
    } catch {
      // Silently fail - products will remain empty array
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) await fetchProducts();
    })();
    return () => (mounted = false);
  }, []);

  const filtered = products.filter((p) => {
    if (search && !p.chemicalname.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (selectedCategory !== "All" && p.category !== selectedCategory)
      return false;
    if (selectedBrand !== "All" && p.manufacturer !== selectedBrand)
      return false;
    return true;
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Single page background: gradient blobs + dotted pattern */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-50">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary blur-3xl opacity-50 rounded-full" />
        <div className="absolute top-150  -right-24 w-96 h-96 bg-secondary blur-3xl opacity-30 rounded-full" />
        <div className="absolute top-300 left-0 w-96 h-96 bg-primary blur-3xl opacity-50 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary blur-3xl opacity-30 rounded-full" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-20"
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="dots-home"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#1c8309" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-home)" />
        </svg>
      </div>

      {/* Content sections */}
      <Hero />
      {/* <Map/> */}
      {/* Products list */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Our Products
              </h2>
              <p className="text-gray-600">
                Discover our range of quality construction chemicals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="btn-primary px-5 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all relative"
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
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {cart.length}
                  </span>
                )}
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-5 py-3 border-2 border-gray-300 hover:border-red-600 rounded-lg font-semibold text-gray-700 hover:text-red-600 transition-all flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Product
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar value={search} onChange={setSearch} />

          {/* Filters */}
          <FilterPanel
            products={products}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Results Count */}
          {filtered.length > 0 && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "product" : "products"}
              </p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            )}
            {products.length > 0 && filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or search
                </p>
              </div>
            )}
            {filtered.map((p) => (
              <Product key={p._id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>
      <Footer />

      {showCart && <Cart onClose={() => setShowCart(false)} />}
      {showAddProduct && (
        <AdminProductForm
          onClose={() => setShowAddProduct(false)}
          onCreated={() => fetchProducts()}
        />
      )}
    </div>
  );
};

export default Home;
