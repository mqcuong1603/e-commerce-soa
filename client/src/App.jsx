import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { useAuth } from "./contexts/AuthContext";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfilePage from "./pages/user/ProfilePage";
import OrdersPage from "./pages/user/OrdersPage";
import OrderDetailPage from "./pages/user/OrderDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import AuthCallback from "./pages/auth/AuthCallback";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AboutPage from "./pages/AboutPage"; // Add this import

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import AdminOrderDetailPage from "./pages/admin/OrderDetailPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import UserManagement from "./pages/admin/UserManagement"; // Using the new UserManagement component
import AdminDiscountPage from "./pages/admin/DiscountPage";
import AddProductPage from "./pages/admin/AddProductPage";
import EditProductPage from "./pages/admin/EditProductPage";

// Auth Guard for protected routes
const ProtectedRoute = ({ children }) => {
  // Use the auth context to check if user is authenticated
  const token = localStorage.getItem("token");

  // If not authenticated, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected route for admin users
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading indicator while authentication state is being initialized
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Verifying admin access...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If not admin, redirect to home
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="about" element={<AboutPage />} />{" "}
              {/* Add this route */}
              <Route path="cart" element={<CartPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
              {/* Auth Routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="reset-password/:token"
                element={<ResetPasswordPage />}
              />
              {/* Protected Routes */}
              <Route path="checkout" element={<CheckoutPage />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                }
              />
              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrdersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <AdminOrderDetailPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProductsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/create"
              element={
                <AdminRoute>
                  <AddProductPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <AdminRoute>
                  <EditProductPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/discounts"
              element={
                <AdminRoute>
                  <AdminDiscountPage />
                </AdminRoute>
              }
            />

            <Route path="auth/callback" element={<AuthCallback />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;
