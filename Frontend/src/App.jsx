import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Toaster from "./Components/Toaster";
import Navbar from "./Components/Navbar";
import PageTransition from "./Components/PageTransition";
import ScrollProgressBar from "./Components/ScrollProgressBar";
import DotGridBackground from "./Components/DotGridBackground";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Login from "./Components/Login";
import AdminLogin from "./Components/AdminLogin";
import Register from "./Components/Register";
import Contact from "./Components/Contact";
import Dashboard from "./Pages/Dashboard";
import AdminDashboardHome from "./Pages/AdminDashboardHome";
import OrderManagement from "./Pages/OrderManagement";
import UserManagement from "./Pages/UserManagement";
import ProductManagement from "./Pages/ProductManagement";
import SuperAdminDashboard from "./Pages/SuperAdminDashboard";
import CreateAdmin from "./Pages/CreateAdmin";
import EditAdmin from "./Pages/EditAdmin";
import Checkout from "./Components/Checkout";
import ForgotPassword from "./Pages/ForgotPassword";
import ProductDetail from "./Pages/ProductDetail";
import OrderSuccess from "./Pages/OrderSuccess";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import SuperAdminProtectedRoute from "./Components/SuperAdminProtectedRoute";
import { checkAdminTokenExpiry } from "./utils/tokenUtils";

function App() {
  // Check for token expiration on mount and periodically
  useEffect(() => {
    // Initial check
    checkAdminTokenExpiry();

    // Check every minute
    const interval = setInterval(() => {
      checkAdminTokenExpiry();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <DotGridBackground />
      <ScrollProgressBar />
      <Toaster />
      <Navbar />
      <PageTransition>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* User Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboardHome />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <OrderManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <UserManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <ProductManagement />
            </AdminProtectedRoute>
          }
        />

        {/* Super Admin Protected routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <SuperAdminProtectedRoute>
              <SuperAdminDashboard />
            </SuperAdminProtectedRoute>
          }
        />
        <Route
          path="/superadmin/create-admin"
          element={
            <SuperAdminProtectedRoute>
              <CreateAdmin />
            </SuperAdminProtectedRoute>
          }
        />
        <Route
          path="/superadmin/edit-admin/:id"
          element={
            <SuperAdminProtectedRoute>
              <EditAdmin />
            </SuperAdminProtectedRoute>
          }
        />

        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </PageTransition>
    </>
  );
}

export default App;
