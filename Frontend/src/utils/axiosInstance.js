/**
 * Centralized Axios Instance with Token Expiration Handling
 * Automatically logs out users/admins when tokens expire
 */
import axios from "axios";
import toast from "react-hot-toast";
import { API_CONFIG } from "../config/constants";

const axiosInstance = axios.create({
  baseURL: API_CONFIG.fullURL,
  withCredentials: true,
  timeout: API_CONFIG.timeout,
});

// Track refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Logout helper function
const performLogout = (isAdmin = false) => {
  if (isAdmin) {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("admin-auth-change"));
    toast.error("Session expired. Please login again.");
    window.location.href = "/admin/login";
  } else {
    // For regular users, clear Zustand store
    const storedData = localStorage.getItem("zwb_user_store");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        data.state.user = null;
        localStorage.setItem("zwb_user_store", JSON.stringify(data));
      } catch {
        localStorage.removeItem("zwb_user_store");
      }
    }
    toast.error("Session expired. Please login again.");
    window.location.href = "/login";
  }
};

// Request interceptor - Add token to headers for admin requests
axiosInstance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) return config;

    // Admin-only routes always get the admin Bearer token
    const isAdminOnlyRoute = config.url?.includes("/admin");
    if (isAdminOnlyRoute) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }

    // Shared routes (order, products) — only attach admin token when
    // no regular user is logged in, so user cookies aren't overridden.
    const isSharedRoute =
      config.url?.includes("/order") || config.url?.includes("/products");
    if (isSharedRoute) {
      let hasRegularUser = false;
      try {
        const stored = localStorage.getItem("zwb_user_store");
        if (stored) {
          hasRegularUser = !!JSON.parse(stored).state?.user;
        }
      } catch { /* ignore parse errors */ }

      if (!hasRegularUser) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error (unauthorized/token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is an admin request
      const adminToken = localStorage.getItem("adminToken");
      const isAdminRequest = originalRequest.url?.includes("/admin");

      // If the failing request IS the refresh-token endpoint, don't retry —
      // doing so causes a deadlock (interceptor queues itself forever).
      // Just reject here; the outer interceptor's catch or hydrate() will
      // handle the logout.
      const isRefreshRequest = originalRequest.url?.includes("/users/refresh-token");
      if (isRefreshRequest) {
        return Promise.reject(error);
      }

      if (isAdminRequest && adminToken) {
        // Admin token expired - logout admin
        performLogout(true);
        return Promise.reject(error);
      }

      // Regular user token expired - try to refresh
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/users/refresh-token", {});
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        performLogout(false);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
