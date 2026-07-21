/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../utils/apiClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [cart, setCartState] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zwb_user_store");
      if (stored) {
        const { user: storedUser, cart: storedCart } = JSON.parse(stored);
        if (storedUser) setUserState(storedUser);
        if (storedCart) setCartState(storedCart);
      }
    } catch { /* ignore parse errors */ }
    
    // Attempt hydration via refresh token
    const hydrate = async () => {
      try {
        await apiClient.post("/users/refresh-token", {});
        const currentUser = await getCurrentUser();
        if (currentUser) setUser(currentUser);
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("zwb_user_store", JSON.stringify({ user, cart }));
  }, [user, cart]);

  const setUser = (u) => setUserState(u);
  const clearUser = () => setUserState(null);

  const addToCart = (product, quantity = 1) => {
    setCartState((prevCart) => {
      const existing = prevCart.find((c) => c._id === product._id);
      if (existing) {
        return prevCart.map((c) =>
          c._id === product._id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartState((prev) => prev.filter((c) => c._id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    setCartState((prev) =>
      prev.map((c) => (c._id === productId ? { ...c, quantity } : c))
    );
  };

  const clearCartLocal = () => setCartState([]);

  const getCartTotal = () => {
    return cart.reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.quantity || 1), 0);
  };

  // API calls
  const login = async (email, password) => {
    const { data } = await apiClient.post("/users/login", { email, password });
    const userData = data?.data?.user;
    if (userData) setUser(userData);
    return userData;
  };

  const register = async (name, email, phone, password, coordinates) => {
    const { data } = await apiClient.post("/users/register", { name, email, phone, password, coordinates });
    const userData = data?.data?.user;
    if (userData) setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await apiClient.post("/users/logout", {});
    } catch { /* ignore network error on logout */ }
    clearUser();
  };

  const getCurrentUser = async () => {
    try {
      const { data } = await apiClient.get("/users/me");
      return data?.data?.user;
    } catch {
      return null;
    }
  };

  const updateProfile = async (name, phone, defaultAddress) => {
    const { data } = await apiClient.put("/users/profile", { name, phone, defaultAddress });
    const updatedUser = data?.data?.user;
    if (updatedUser) setUser(updatedUser);
    return updatedUser;
  };

  // Orders
  const createOrder = async (order) => {
    const { data } = await apiClient.post("/order/add", {
      productId: order.productId,
      quantity: order.quantity,
      address: order.address,
      description: order.description || "",
    });
    return data?.data;
  };

  const getOrders = async () => {
    const { data } = await apiClient.get("/order/view/user");
    return data?.data;
  };

  const getAllOrders = async () => {
    const { data } = await apiClient.get("/order/view/all");
    return data?.data;
  };

  const updateOrderStatus = async (orderId, status) => {
    const { data } = await apiClient.patch(`/order/${orderId}`, { status });
    return data?.data;
  };

  const deleteOrder = async (orderId) => {
    const { data } = await apiClient.delete(`/order/${orderId}`);
    return data;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        cart,
        loading,
        setLoading,
        setUser,
        clearUser,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCartLocal,
        getCartTotal,
        login,
        register,
        logout,
        getCurrentUser,
        updateProfile,
        createOrder,
        getOrders,
        getAllOrders,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
