import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import Toaster from "./Components/Toaster";
import Navbar from "./Components/Navbar";
import PageTransition from "./Components/PageTransition";
import ScrollProgressBar from "./Components/ScrollProgressBar";
import DotGridBackground from "./Components/DotGridBackground";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import SuperAdminProtectedRoute from "./Components/SuperAdminProtectedRoute";

// Lazy-loaded pages/components for code splitting
const Home = lazy(() => import("./Pages/Home"));
const About = lazy(() => import("./Pages/About"));
const Login = lazy(() => import("./Components/Login"));
const AdminLogin = lazy(() => import("./Components/AdminLogin"));
const Register = lazy(() => import("./Components/Register"));
const Contact = lazy(() => import("./Components/Contact"));
const BlogList = lazy(() => import("./Pages/BlogList"));
const BlogDetail = lazy(() => import("./Pages/BlogDetail"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const UserProfile = lazy(() => import("./Pages/UserProfile"));
const AdminDashboardHome = lazy(() => import("./Pages/AdminDashboardHome"));
const AdminAnalytics = lazy(() => import("./Pages/AdminAnalytics"));
const OrderManagement = lazy(() => import("./Pages/OrderManagement"));
const UserManagement = lazy(() => import("./Pages/UserManagement"));
const ProductManagement = lazy(() => import("./Pages/ProductManagement"));
const BlogManagement = lazy(() => import("./Pages/BlogManagement"));
const SuperAdminDashboard = lazy(() => import("./Pages/SuperAdminDashboard"));
const CreateAdmin = lazy(() => import("./Pages/CreateAdmin"));
const EditAdmin = lazy(() => import("./Pages/EditAdmin"));
const Checkout = lazy(() => import("./Components/Checkout"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));
const ProductDetail = lazy(() => import("./Pages/ProductDetail"));
const OrderSuccess = lazy(() => import("./Pages/OrderSuccess"));
const NotFound = lazy(() => import("./Pages/NotFound"));
function App() {
  return (
    <>
      <DotGridBackground />
      <ScrollProgressBar />
      <Toaster />
      <Navbar />
      <PageTransition>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
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
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
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
            path="/admin/analytics"
            element={
              <AdminProtectedRoute>
                <AdminAnalytics />
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
          <Route
            path="/admin/blogs"
            element={
              <AdminProtectedRoute>
                <BlogManagement />
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
        </Suspense>
      </PageTransition>
    </>
  );
}

export default App;
