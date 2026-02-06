import "./App.css";
import { Routes, Route } from "react-router-dom";
import Toaster from "./Components/Toaster";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Contact from "./Components/Contact";
import Dashboard from "./Pages/Dashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import SuperAdminDashboard from "./Pages/SuperAdminDashboard";
import CreateAdmin from "./Pages/CreateAdmin";
import EditAdmin from "./Pages/EditAdmin";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import SuperAdminProtectedRoute from "./Components/SuperAdminProtectedRoute";

function App() {
  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />

        {/* User Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
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
      </Routes>
    </>
  );
}

export default App;
