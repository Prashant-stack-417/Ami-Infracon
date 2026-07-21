import toast from "react-hot-toast";
import { API_CONFIG } from "../config/constants";

// Helper to handle unauthorized/expired sessions
const performLogout = (isAdmin = false) => {
  if (isAdmin) {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("admin-auth-change"));
    toast.error("Session expired. Please login again.");
    window.location.href = "/admin/login";
  } else {
    localStorage.removeItem("zwb_user_store");
    toast.error("Session expired. Please login again.");
    window.location.href = "/login";
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

/**
 * Native fetch wrapper replacing axios.
 * Handles automatic JSON parsing, admin tokens, and 401 refresh flows.
 */
const apiClient = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.fullURL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Attach admin token logic
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    const isAdminPanel = window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/superadmin");
    const isSharedRoute = url.includes("/order") || url.includes("/products");
    
    let hasRegularUser = false;
    try {
      const stored = localStorage.getItem("zwb_user_store");
      if (stored) hasRegularUser = !!JSON.parse(stored).user;
    } catch { /* ignore parse errors */ }

    if (isAdminPanel || (isSharedRoute && !hasRegularUser)) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }

  // Automatically stringify JSON body if present
  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Ensure credentials for HttpOnly cookies (refresh token)
  config.credentials = "include";

  let response = await fetch(url, config);

  // Handle 401 and Token Refresh
  if (response.status === 401 && !config._retry) {
    const isRefreshRequest = endpoint.includes("/users/refresh-token");
    if (isRefreshRequest) {
      throw await response.json(); // Don't retry the refresh itself
    }

    const isAdminPanel = window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/superadmin");
    if (isAdminPanel && adminToken) {
      performLogout(true);
      throw new Error("Admin token expired");
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(endpoint, options));
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_CONFIG.fullURL}/users/refresh-token`, { method: "POST", credentials: "include" });
      if (!refreshRes.ok) throw new Error("Refresh failed");
      
      processQueue(null);
      response = await fetch(url, config); // Retry original request
    } catch (err) {
      processQueue(err);
      performLogout(false);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  // Parse JSON response safely
  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw Object.assign(new Error(data?.message || response.statusText), { response: { data, status: response.status } });
  }

  return { data, status: response.status };
};

// Convenience methods to mirror Axios API
apiClient.get = (url, config) => apiClient(url, { ...config, method: "GET" });
apiClient.post = (url, body, config) => apiClient(url, { ...config, method: "POST", body });
apiClient.put = (url, body, config) => apiClient(url, { ...config, method: "PUT", body });
apiClient.patch = (url, body, config) => apiClient(url, { ...config, method: "PATCH", body });
apiClient.delete = (url, config) => apiClient(url, { ...config, method: "DELETE" });

export default apiClient;
