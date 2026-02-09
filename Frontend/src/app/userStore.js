import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Point frontend API calls to the backend server
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3802/api";
axios.defaults.withCredentials = true;

// Use a dedicated key for Zustand-persist storage
const PERSIST_KEY = "zwb_user_store";

// Add axios interceptor to handle token refresh
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

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/users/refresh-token", {}, { withCredentials: true });
        processQueue(null);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear user on refresh failure
        useUserStore.getState().clearUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const userStore = (set, get) => ({
  user: null,
  cart: [],
  loading: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ user: null }),

  // Cart actions (frontend-only)
  addToCart: (product, quantity = 1) =>
    set((state) => {
      const existing = state.cart.find((c) => c._id === product._id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c._id === product._id
              ? { ...c, quantity: c.quantity + quantity }
              : c,
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((c) => c._id !== productId) })),

  updateCartQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c._id === productId ? { ...c, quantity } : c,
      ),
    })),

  clearCartLocal: () => set({ cart: [] }),

  getCartTotal: () =>
    get().cart.reduce(
      (s, i) => s + (parseFloat(i.price) || 0) * (i.quantity || 1),
      0,
    ),

  // Call backend login and return user object
  login: async (email, password) => {
    const resp = await axios.post(
      "/users/login",
      { email, password },
      { withCredentials: true },
    );
    return resp.data?.data?.user;
  },

  // Call backend register and return user object
  register: async (name, email, phone, password, coordinates) => {
    const resp = await axios.post(
      "/users/register",
      { name, email, phone, password, coordinates },
      { withCredentials: true },
    );
    return resp.data?.data?.user;
  },

  // Hit refresh-token endpoint to renew cookies
  refresh: async () => {
    await axios.post("/users/refresh-token", {}, { withCredentials: true });
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const resp = await axios.get("/users/me", { withCredentials: true });
      return resp.data?.data?.user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  // Load user from storage and try to refresh tokens silently
  hydrate: async () => {
    try {
      // Allow a microtask so Zustand persist can rehydrate state
      await new Promise((r) => setTimeout(r, 0));
      const user = get().user;
      if (user) {
        // Try to get fresh user data
        const currentUser = await get().getCurrentUser();
        if (currentUser) {
          set({ user: currentUser });
          return true;
        }
      }
      return false;
    } catch {
      set({ user: null });
      return false;
    }
  },

  // Logout server-side and clear local user
  logout: async () => {
    try {
      await axios.post("/users/logout", {}, { withCredentials: true });
    } catch {
      // ignore network errors on logout
    } finally {
      get().clearUser();
    }
  },

  // Order Management

  // Create a new order
  createOrder: async (order) => {
    try {
      const resp = await axios.post(
        "/order",
        {
          productId: order.productId,
          quantity: order.quantity,
          address: order.address,
          description: order.description || "",
        },
        { withCredentials: true },
      );

      return resp.data?.data;
    } catch (e) {
      console.error("Order creation error:", e);
      throw e;
    }
  },

  // Get orders for current user
  getOrders: async () => {
    try {
      const resp = await axios.get("/order/view/user", {
        withCredentials: true,
      });
      return resp.data?.data;
    } catch (e) {
      console.error("Failed to get orders:", e);
      throw e;
    }
  },

  // Get all orders (admin only)
  getAllOrders: async () => {
    try {
      const resp = await axios.get("/order/view/all", {
        withCredentials: true,
      });
      return resp.data?.data;
    } catch (e) {
      console.error("Failed to get all orders:", e);
      throw e;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const resp = await axios.patch(
        `/order/${orderId}`,
        { status },
        { withCredentials: true },
      );
      return resp.data?.data;
    } catch (e) {
      console.error("Failed to update order:", e);
      throw e;
    }
  },

  // Delete an order
  deleteOrder: async (orderId) => {
    try {
      const resp = await axios.delete(`/order/${orderId}`, {
        withCredentials: true,
      });
      return resp.data;
    } catch (e) {
      console.error("Failed to delete order:", e);
      throw e;
    }
  },
});

const useUserStore = create(
  persist(userStore, {
    name: PERSIST_KEY,
    // Persist user and cart slices
    partialize: (state) => ({ user: state.user, cart: state.cart }),
  }),
);

export default useUserStore;
