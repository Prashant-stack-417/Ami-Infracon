import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../utils/axiosInstance";

// Use a dedicated key for Zustand-persist storage
const PERSIST_KEY = "zwb_user_store";

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
    const resp = await axiosInstance.post("/users/login", {
      email,
      password,
    });
    return resp.data?.data?.user;
  },

  // Call backend register and return user object
  register: async (name, email, phone, password, coordinates) => {
    const resp = await axiosInstance.post("/users/register", {
      name,
      email,
      phone,
      password,
      coordinates,
    });
    return resp.data?.data?.user;
  },

  // Hit refresh-token endpoint to renew cookies
  refresh: async () => {
    await axiosInstance.post("/users/refresh-token", {});
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const resp = await axiosInstance.get("/users/me");
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
      await axiosInstance.post("/users/logout", {});
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
      const resp = await axiosInstance.post("/order", {
        productId: order.productId,
        quantity: order.quantity,
        address: order.address,
        description: order.description || "",
      });

      return resp.data?.data;
    } catch (e) {
      console.error("Order creation error:", e);
      throw e;
    }
  },

  // Get orders for current user
  getOrders: async () => {
    try {
      const resp = await axiosInstance.get("/order/view/user");
      return resp.data?.data;
    } catch (e) {
      console.error("Failed to get orders:", e);
      throw e;
    }
  },

  // Get all orders (admin only)
  getAllOrders: async () => {
    try {
      const resp = await axiosInstance.get("/order/view/all");
      return resp.data?.data;
    } catch (e) {
      console.error("Failed to get all orders:", e);
      throw e;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const resp = await axiosInstance.patch(`/order/${orderId}`, { status });
      return resp.data?.data;
    } catch (e) {
      console.error("Failed to update order:", e);
      throw e;
    }
  },

  // Delete an order
  deleteOrder: async (orderId) => {
    try {
      const resp = await axiosInstance.delete(`/order/${orderId}`);
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
