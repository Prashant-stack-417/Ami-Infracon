import { useEffect, useState, useCallback, useMemo } from "react";
import anime from "animejs";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../utils/apiClient";
import { resolveImage } from "../utils/imageUtils";
import { useIsMounted } from "../hooks/useCustomHooks";
import { handleApiError } from "../utils/errorHandler";
import {
  IconPackage,
  IconTrash,
  IconEdit,
  IconPlus,
  IconSearch,
  IconAlertTriangle,
  IconUpload,
  IconX,
  IconDownload,
} from "@tabler/icons-react";
import { SkeletonCard, SkeletonText } from "../Components/SkeletonLoader";

const ProductManagement = () => {
  const navigate = useNavigate();
  const isMounted = useIsMounted();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);
  const productsPerPage = 12;
  const [productForm, setProductForm] = useState({
    chemicalname: "",
    description: "",
    category: "Other",
    sku: "",
    hsnCode: "",
    price: "",
    unit: "kg",
    manufacturer: "",
    specifications: "",
    image: null,
  });

  const checkAuth = useCallback(() => {
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("adminToken");

    if (!storedAdmin || !token) {
      navigate("/login");
      return false;
    }
    return true;
  }, [navigate]);

  const loadProducts = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const productsRes = await apiClient
        .get(`/products?page=${currentPage}&limit=${productsPerPage}`)
        .catch(() => ({ data: { data: { products: [] } } }));

      // Fetch low stock alerts (admin-only)
      if (token) {
        const lowStockRes = await apiClient
          .get("/analytics/low-stock")
          .catch(() => ({ data: { data: [] } }));
        if (isMounted.current) {
          setLowStockProducts(lowStockRes.data?.data || []);
        }
      }

      if (!isMounted.current) return;

      const productsData = productsRes.data?.data?.products || [];
      setProducts(productsData);
      setPaginationData(productsRes.data?.data?.pagination || null);
    } catch (error) {
      if (!isMounted.current) return;
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        handleApiError(error, {
          fallbackMessage: "Failed to load products",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isMounted, navigate]);

  useEffect(() => {
    if (checkAuth()) {
      loadProducts();
    }
  }, [checkAuth, loadProducts, currentPage]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: ".product-mgt-main",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: "easeOutCubic"
      });
      anime({
        targets: ".product-mgt-stat",
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 500,
        easing: "easeOutCubic"
      });
    }
  }, [loading]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.chemicalname?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.manufacturer?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower)
    );
  }), [products, searchQuery]);

  useEffect(() => {
    if (!loading && filteredProducts.length > 0) {
      anime({
        targets: ".product-mgt-card",
        opacity: [0, 1],
        scale: [0.9, 1],
        delay: anime.stagger(50),
        duration: 400,
        easing: "easeOutCubic"
      });
    }
  }, [loading, filteredProducts]);

  const handleProductSave = async (e) => {
    e.preventDefault();
    try {
      // Upload image first if present
      let imageUrl = "";
      if (productForm.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", productForm.image);
        const uploadRes = await apiClient.post(
          "/products/upload",
          imageFormData,
        );
        imageUrl = uploadRes.data?.data?.url || "";
      }

      const productData = {
        chemicalname: productForm.chemicalname,
        description: productForm.description,
        category: productForm.category,
        sku: productForm.sku,
        hsnCode: productForm.hsnCode,
        price: productForm.price,
        unit: productForm.unit,
        quantity: 0,
        minOrderQuantity: 1,
        manufacturer: productForm.manufacturer,
        specifications: productForm.specifications,
        image: imageUrl || editingProduct?.image || "",
      };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, productData);
        toast.success("Product updated successfully");
      } else {
        await apiClient.post("/products", productData);
        toast.success("Product created successfully");
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        chemicalname: "",
        description: "",
        category: "Other",
        sku: "",
        hsnCode: "",
        price: "",
        unit: "kg",
        manufacturer: "",
        specifications: "",
        image: null,
      });
      if (isMounted.current) {
        loadProducts();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to save product",
      });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      chemicalname: product.chemicalname,
      description: product.description || "",
      category: product.category || "Other",
      sku: product.sku || "",
      hsnCode: product.hsnCode || "",
      price: product.price,
      unit: product.unit || "kg",
      manufacturer: product.manufacturer || "",
      specifications: product.specifications || "",
      image: null,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      if (isMounted.current) {
        loadProducts();
      }
    } catch (error) {
      handleApiError(error, {
        fallbackMessage: "Failed to delete product",
      });
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkUploading(true);
    const formData = new FormData();
    formData.append("csv", bulkFile);
    try {
      const res = await apiClient.post("/products/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { inserted, skipped } = res.data?.data || {};
      toast.success(`Bulk upload done: ${inserted} added, ${skipped} skipped`);
      setShowBulkUpload(false);
      setBulkFile(null);
      if (isMounted.current) loadProducts();
    } catch (error) {
      handleApiError(error, { fallbackMessage: "Bulk upload failed" });
    } finally {
      setBulkUploading(false);
    }
  };

  // Download a sample CSV template
  const downloadSampleCsv = () => {
    const header = "chemicalname,description,category,sku,hsnCode,price,unit,quantity,minOrderQuantity,lowStockThreshold,manufacturer,specifications";
    const sample = "Sample Waterproof Coat,Protects from water,Waterproofing,SKU001,38249099,500,liter,100,5,10,Ami Infracon,UV resistant";
    const blob = new Blob([`${header}\n${sample}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-8">
              <SkeletonText className="h-10 w-1/4 mb-2" />
              <SkeletonText className="h-4 w-1/3 mb-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-linear-to-br from-primary/5 via-white to-secondary/5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 product-mgt-main opacity-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage your product catalog and inventory
              </p>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative flex-1 min-w-62.5">
                <IconSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
              >
                <IconUpload size={18} />
                <span>Bulk Upload</span>
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    chemicalname: "",
                    description: "",
                    category: "Other",
                    sku: "",
                    hsnCode: "",
                    price: "",
                    unit: "kg",
                    manufacturer: "",
                    specifications: "",
                    image: null,
                  });
                  setShowProductForm(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark hover:scale-[1.05] active:scale-[0.95] transition-all shadow-md hover:shadow-lg font-semibold whitespace-nowrap"
              >
                <IconPlus size={20} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 product-mgt-stat opacity-0">
              <p className="text-sm text-blue-600 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-blue-900">{products.length}</p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 product-mgt-stat opacity-0">
              <p className="text-sm text-green-600 font-medium">Categories</p>
              <p className="text-2xl font-bold text-green-900">
                {new Set(products.map((p) => p.category)).size}
              </p>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 product-mgt-stat opacity-0">
              <p className="text-sm text-purple-600 font-medium">Avg Price</p>
              <p className="text-2xl font-bold text-purple-900">
                ₹
                {products.length > 0
                  ? Math.round(
                    products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) /
                    products.length,
                  ).toLocaleString("en-IN")
                  : 0}
              </p>
            </div>
            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4 product-mgt-stat opacity-0">
              <p className="text-sm text-orange-600 font-medium">Manufacturers</p>
              <p className="text-2xl font-bold text-orange-900">
                {new Set(products.map((p) => p.manufacturer).filter(Boolean)).size}
              </p>
            </div>
          </div>

          {/* Low Stock Alert Banner */}
          {lowStockProducts.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <IconAlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    ⚠️ {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Low on Stock
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {lowStockProducts.map((p) => (
                      <span key={p._id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-sm text-amber-800 font-medium">
                        {p.chemicalname}
                        <span className="text-xs text-amber-600">({p.quantity} left / threshold: {p.lowStockThreshold})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 product-mgt-card opacity-0"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden bg-gray-50 aspect-square">
                  <img
                    src={resolveImage(product.image)}
                    alt={product.chemicalname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-linear-to-r from-red-600 to-red-500 rounded-full shadow-md">
                        {product.category}
                      </span>
                    </div>
                  )}
                  {/* SKU Badge */}
                  {product.sku && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm rounded-md shadow">
                        {product.sku}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-14">
                    {product.chemicalname}
                  </h3>

                  {/* Brand */}
                  {product.manufacturer && (
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
                      <span className="text-sm text-gray-600 font-medium truncate">
                        {product.manufacturer}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-10">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100">
                    <span className="text-2xl font-bold text-red-600">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-gray-500">/{product.unit}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <IconEdit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <IconTrash size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 mb-4 text-gray-300">
                <IconPackage size={80} stroke={1.5} />
              </div>
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery ? "No products found matching your search" : "No products found"}
              </p>
              {!searchQuery && (
                <>
                  <p className="text-gray-400 text-sm mb-4">
                    Get started by adding your first product
                  </p>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        chemicalname: "",
                        description: "",
                        category: "Other",
                        sku: "",
                        hsnCode: "",
                        price: "",
                        unit: "kg",
                        manufacturer: "",
                        specifications: "",
                        image: null,
                      });
                      setShowProductForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md"
                  >
                    <IconPlus size={20} />
                    <span>Add Your First Product</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {paginationData && paginationData.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{((currentPage - 1) * productsPerPage) + 1}</span> to{" "}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * productsPerPage, paginationData.total)}
                </span>{" "}
                of <span className="font-medium text-gray-900">{paginationData.total}</span> products
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                >
                  Previous
                </button>
                <div className="flex gap-1 items-center">
                  {[...Array(paginationData.totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                        currentPage === idx + 1
                          ? "bg-primary text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                  disabled={currentPage === paginationData.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          >
            <div
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            >
              <h3 className="text-2xl font-bold text-primary-content mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <form onSubmit={handleProductSave} className="space-y-4">
                {/* Chemical Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chemical Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.chemicalname}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        chemicalname: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Category and SKU */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Cement">Cement</option>
                      <option value="Adhesive">Adhesive</option>
                      <option value="Waterproofing">Waterproofing</option>
                      <option value="Coating">Coating</option>
                      <option value="Sealant">Sealant</option>
                      <option value="Primer">Primer</option>
                      <option value="Concrete Admixture">
                        Concrete Admixture
                      </option>
                      <option value="Repair Material">Repair Material</option>
                      <option value="Grout">Grout</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          sku: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Product code"
                    />
                  </div>
                </div>

                {/* HSN Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={productForm.hsnCode}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        hsnCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 38249099"
                  />
                </div>

                {/* Unit Rate and Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={productForm.unit}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          unit: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="bag">bag</option>
                      <option value="piece">piece</option>
                      <option value="box">box</option>
                      <option value="sqm">sqm</option>
                      <option value="meter">meter</option>
                    </select>
                  </div>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer/Brand
                  </label>
                  <input
                    type="text"
                    value={productForm.manufacturer}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        manufacturer: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specifications
                  </label>
                  <textarea
                    value={productForm.specifications}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        specifications: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Technical specs"
                  />
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        image: e.target.files[0],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductForm({
                        chemicalname: "",
                        description: "",
                        category: "Other",
                        sku: "",
                        hsnCode: "",
                        price: "",
                        unit: "kg",
                        manufacturer: "",
                        specifications: "",
                        image: null,
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Bulk Upload Products</h3>
                <button onClick={() => { setShowBulkUpload(false); setBulkFile(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <IconX size={22} />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
                Upload a CSV file with product data. Each row becomes one product.
              </div>

              <button
                onClick={downloadSampleCsv}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <IconDownload size={16} />
                Download Sample CSV Template
              </button>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {bulkFile && (
                  <p className="mt-1.5 text-xs text-green-600 font-medium">✓ {bulkFile.name} selected</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || bulkUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {bulkUploading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><IconUpload size={18} /> Upload Products</>
                  )}
                </button>
                <button
                  onClick={() => { setShowBulkUpload(false); setBulkFile(null); }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
