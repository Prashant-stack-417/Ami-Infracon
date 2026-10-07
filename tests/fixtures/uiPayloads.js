/**
 * UI Payload Fixtures
 * Exact request bodies copied from Frontend source files.
 * Used in integration tests to verify that the real UI payloads succeed.
 */

// From Frontend/src/Pages/ProductManagement.jsx — handleProductSave
export const productCreatePayload = {
  chemicalname: "AmiGuard WP-300",
  description: "High performance waterproofing membrane",
  category: "Waterproofing",
  sku: "AMI-WP-300",
  hsnCode: "38249099",
  price: 1499,
  unit: "liter",
  quantity: 100,
  minOrderQuantity: 5,
  lowStockThreshold: 15,
  manufacturer: "Ami Infracon LLP",
  specifications: "UV resistant, 2-component system",
  image: "",
};

// From Frontend/src/Pages/ProductManagement.jsx — handleEditProduct (PUT body)
export const productEditPayload = {
  chemicalname: "AmiGuard WP-300 Updated",
  description: "Updated waterproofing membrane",
  category: "Waterproofing",
  sku: "AMI-WP-300",
  hsnCode: "38249099",
  price: 1599,
  unit: "liter",
  quantity: 100,   // This should be IGNORED by PUT (E.1)
  minOrderQuantity: 5,
  lowStockThreshold: 15,
  manufacturer: "Ami Infracon LLP",
  specifications: "UV resistant, updated formula",
  image: "",
};

// From Frontend/src/Pages/Register.jsx
export const registerPayload = {
  name: "Prashant Sharma",
  email: "prashant@example.com",
  phone: "+919876543210",
  password: "Password123",
};

// From Frontend/src/Pages/UserProfile.jsx — profile update
export const profileUpdatePayload = {
  name: "Prashant Updated",
  phone: "+919876543211",
  defaultAddress: {
    addressLine1: "123 Main St",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
  },
};

// From Frontend/src/Pages/CreateAdmin.jsx — create admin form
export const createAdminPayload = {
  name: "Vijay Admin",
  email: "vijay.Admin@gmail.com",
  password: "AdminPass123",
  role: "superadmin",
};

// From Frontend/src/Pages/EditAdmin.jsx — edit admin form
export const editAdminPayload = {
  name: "Vijay Updated",
  email: "vijay.Admin@gmail.com",
  role: "admin",
  isActive: true,
};

// From Frontend/src/Components/Checkout.jsx — checkout submission
export const checkoutPayload = {
  address: "123 Main St, Mumbai, Maharashtra 400001",
  items: [
    { productId: "PLACEHOLDER_ID", quantity: 2 },
  ],
};

// Blog create payload (multipart fields — title, content are always sent)
// From Frontend/src/Pages/BlogManagement.jsx (AdminBlogForm)
export const blogCreateFields = {
  title: "Construction Chemical Guide 2024",
  slug: "construction-chemical-guide-2024",
  content: "Comprehensive guide to construction chemicals...",
  isPublished: "false",
};
