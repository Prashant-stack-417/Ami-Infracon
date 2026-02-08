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
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
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
    } catch (err) {
      console.error("Failed to fetch products", err);
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
    if (priceRange.min !== "" && Number(p.price) < Number(priceRange.min))
      return false;
    if (priceRange.max !== "" && Number(p.price) > Number(priceRange.max))
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
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Products</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCart(true)}
                className="btn-primary px-3 py-2 rounded"
              >
                Cart ({cart.length})
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-3 py-2 border rounded"
                >
                  Add Product
                </button>
              )}
            </div>
          </div>

          <SearchBar value={search} onChange={setSearch} />
          <FilterPanel
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 && <div>Loading products...</div>}
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
