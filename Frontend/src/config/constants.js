/**
 * Application Constants
 * Centralized configuration for the application
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3802",
  apiPath: "/api",
  get fullURL() {
    return `${this.baseURL}${this.apiPath}`;
  },
  timeout: 30000, // 30 seconds
};

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
  tokenKey: "adminToken",
  adminKey: "admin",
  userStoreKey: "zwb_user_store",
  tokenCheckInterval: 60000, // 1 minute
};

/**
 * Validation Patterns
 */
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  adminEmail: /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i,
  phone: /^\+?[1-9]\d{1,14}$/,
  phoneIndia: /^[0-9]{10}$/,
  postalCode: /^[0-9]{6}$/,
  password: {
    minLength: 6,
  },
};

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/**
 * User Roles
 */
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
};

/**
 * Product Categories — must match backend Product.model.js category enum
 */
export const PRODUCT_CATEGORIES = [
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

/**
 * Product Units — must match backend Product.model.js unit enum
 */
export const PRODUCT_UNITS = ["kg", "liter", "bag", "piece", "box", "sqm", "meter"];

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
};

/**
 * Debounce Delays (ms)
 */
export const DEBOUNCE_DELAYS = {
  search: 300,
  input: 500,
  resize: 200,
};

/**
 * Company Information
 */
export const COMPANY_INFO = {
  name: {
    prefix: "Ami",
    main: "Infracon",
    suffix: "LLP",
  },
  get fullName() {
    return `${this.name.prefix} ${this.name.main} ${this.name.suffix}`;
  },
};
