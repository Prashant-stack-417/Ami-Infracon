import { useEffect, useLayoutEffect, useState, useMemo, useCallback, useRef } from "react";
import anime from "animejs";
import Hero from "../Components/HomeComponents/Hero";
import Footer from "../Components/HomeComponents/Footer";
import Product from "../Components/Product";
import SearchBar from "../Components/SearchBar";
import FilterPanel from "../Components/FilterPanel";
import Cart from "../Components/Cart";
import AdminProductForm from "../Components/AdminProductForm";
import { useUserContext } from "../app/UserContext";
import apiClient from "../utils/apiClient";
import toast from "react-hot-toast";
import { useDebounce } from "../hooks/useCustomHooks";
import { DEBOUNCE_DELAYS } from "../config/constants";
import useAnimeCartFx from "../hooks/useAnimeCartFx";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const { addToCart } = useUserContext();
  const { cart } = useUserContext();
  const { user } = useUserContext();
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Refs for animations
  const sectionTitleRef = useRef(null);
  const sectionSubRef = useRef(null);
  const cartBadgeRef = useRef(null);
  const floatBtnRef = useRef(null);
  const bobAnimRef = useRef(null);
  const entranceAnimRef = useRef(null);
  const filtersRef = useRef(null);
  const productsGridRef = useRef(null);
  const prevCartLen = useRef(cart.length);

  const { playCartBadgeBounce } = useAnimeCartFx();

  // Debounce search
  const debouncedSearch = useDebounce(search, DEBOUNCE_DELAYS.search);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiClient.get("/products");
      const productsList = response.data?.data?.products || [];
      setProducts(productsList);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) await fetchProducts();
    })();
    return () => {
      mounted = false;
    };
  }, [fetchProducts]);

  // Scroll-triggered section title animation
  useEffect(() => {
    const el = sectionTitleRef.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    if (sectionSubRef.current) {
      sectionSubRef.current.style.opacity = "0";
      sectionSubRef.current.style.transform = "translateY(20px)";
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate title with letter-spacing effect
          anime({
            targets: el,
            opacity: [0, 1],
            translateY: [30, 0],
            letterSpacing: ["0.1em", "-0.02em"],
            duration: 900,
            easing: "easeOutElastic(1, .8)",
          });

          // Subtitle follows
          if (sectionSubRef.current) {
            anime({
              targets: sectionSubRef.current,
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 700,
              delay: 200,
              easing: "easeOutCubic",
            });
          }

          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll-triggered filter panel animation
  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          anime({
            targets: el,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            delay: 300,
            easing: "easeOutCubic",
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Floating button entrance animation on mount
  useLayoutEffect(() => {
    if (!floatBtnRef.current) return;
    floatBtnRef.current.style.opacity = "0";
    floatBtnRef.current.style.transform = "translateY(80px) scale(0.6)";
  }, []);

  useEffect(() => {
    if (!floatBtnRef.current) return;
    let mounted = true;
    entranceAnimRef.current = anime({
      targets: floatBtnRef.current,
      translateY: [80, 0],
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 700,
      delay: 400,
      easing: "easeOutElastic(1, .6)",
      complete: () => {
        if (!mounted) return;
        // Start continuous idle bob after entrance finishes
        bobAnimRef.current = anime({
          targets: floatBtnRef.current,
          translateY: [-8, 8],
          duration: 1800,
          loop: true,
          direction: "alternate",
          easing: "easeInOutSine",
        });
      },
    });
    return () => {
      mounted = false;
      if (entranceAnimRef.current) entranceAnimRef.current.pause();
      if (bobAnimRef.current) bobAnimRef.current.pause();
    };
  }, []);

  // Cart badge bounce + button wiggle when cart count changes
  useEffect(() => {
    if (cart.length !== prevCartLen.current && cart.length > 0) {
      if (cartBadgeRef.current) playCartBadgeBounce(cartBadgeRef.current);
      // Pause bob, do wiggle, then resume bob
      if (bobAnimRef.current) bobAnimRef.current.pause();
      if (floatBtnRef.current) {
        anime({
          targets: floatBtnRef.current,
          rotate: [0, -15, 15, -10, 10, -5, 5, 0],
          scale: [1, 1.2, 1],
          duration: 600,
          easing: "easeInOutSine",
          complete: () => {
            if (bobAnimRef.current) bobAnimRef.current.play();
          },
        });
      }
    }
    prevCartLen.current = cart.length;
  }, [cart.length, playCartBadgeBounce]);

  // Memoize filtered products
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (
          debouncedSearch &&
          !p.chemicalname.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
          return false;
        if (selectedCategory !== "All" && p.category !== selectedCategory)
          return false;
        if (selectedBrand !== "All" && p.manufacturer !== selectedBrand)
          return false;
        return true;
      }),
    [products, debouncedSearch, selectedCategory, selectedBrand],
  );

  // Memoize addToCart handler
  const handleAddToCart = useCallback(
    (product, quantity) => {
      addToCart(product, quantity);
    },
    [addToCart],
  );

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

      {/* Products list */}
      <section id="products" className="py-phi-xl">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-phi-lg gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-1 bg-primary rounded-full" />
                <span className="type-overline text-primary">Product Catalog</span>
              </div>
              <h2
                ref={sectionTitleRef}
                className="type-section-title text-gradient-primary mb-phi-xs font-bold"
              >
                Our Products
              </h2>
              <p ref={sectionSubRef} className="type-body text-gray-600">
                Discover our range of quality construction chemicals
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-5 py-3 border-2 border-gray-300 hover:border-red-600 rounded-lg type-label font-semibold text-gray-700 hover:text-red-600 transition-all flex items-center gap-2"
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
          <div ref={filtersRef}>
            <FilterPanel
              products={products}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          {/* Results Count */}
          {filtered.length > 0 && (
            <div className="mb-phi-lg flex items-center justify-between">
              <p className="type-caption text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "product" : "products"}
              {(search || selectedBrand !== "All" || selectedCategory !== "All") && (
                  <span className="ml-1 text-gray-400">matching your filters</span>
                )}
              </p>
              {(search || selectedBrand !== "All" || selectedCategory !== "All") && (
                <button
                  className="text-xs text-primary font-semibold hover:underline"
                  onClick={() => {
                    setSearch("");
                    setSelectedBrand("All");
                    setSelectedCategory("All");
                  }}
                >
                  Clear all filters ×
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          <div ref={productsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24">
                <div className="w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="type-subtitle text-gray-500 mb-1">Loading products...</p>
                <p className="type-caption text-gray-400">Please wait while we fetch the catalog</p>
              </div>
            )}
            {products.length > 0 && filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24">
                <div className="w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="type-subtitle text-gray-500 mb-2">No products found</p>
                <p className="type-caption text-gray-400 mb-4">
                  Try adjusting your filters or search term
                </p>
                <button
                  className="btn-primary px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap"
                  onClick={() => {
                    setSearch("");
                    setSelectedBrand("All");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
            {filtered.map((p, i) => (
              <Product key={p._id} product={p} onAddToCart={handleAddToCart} index={i} />
            ))}
          </div>
        </div>
      </section>
      <Footer />

      {/* Floating Cart Button */}
      <button
        ref={floatBtnRef}
        onClick={() => setShowCart(true)}
        aria-label={`Open cart${cart.length > 0 ? `, ${cart.length} items` : ""}`}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full btn-primary shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary/40"
      >
        <svg
          className="w-7 h-7"
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
        {cart.length > 0 && (
          <span
            ref={cartBadgeRef}
            className="absolute -top-1.5 -right-1.5 bg-white text-red-600 font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-red-100"
            style={{ fontSize: "var(--font-size-xs)" }}
          >
            {cart.length}
          </span>
        )}
      </button>

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
