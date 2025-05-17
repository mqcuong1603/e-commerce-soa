/**
 * Application routes configuration
 *
 * This file defines all routes for the e-commerce application.
 * It uses React Router v6 route configuration.
 */

import { Navigate } from "react-router-dom";

// Layout
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Page components
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
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
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminDiscountPage from "./pages/admin/DiscountPage";
import UserManagement from "./pages/admin/UserManagement";
import AboutPage from "./pages/AboutPage"; // Add this line

// Auth guards
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestOnlyRoute from "./components/auth/GuestOnlyRoute";
import RequireAdmin from "./components/auth/RequireAdmin";

/**
 * Routes configuration
 * Each route object includes:
 * - path: URL path
 * - element: Component to render
 * - children: Nested routes (optional)
 * - auth: Authentication requirement (optional)
 */
const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Public routes - accessible to all users
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "category/:slug",
        element: <CategoryPage />,
      },
      {
        path: "about", // Add this route block
        element: <AboutPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },

      // Auth routes - guests only (redirect logged-in users)
      {
        path: "login",
        element: (
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "register",
        element: (
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <GuestOnlyRoute>
            <ForgotPasswordPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <GuestOnlyRoute>
            <ResetPasswordPage />
          </GuestOnlyRoute>
        ),
      },

      // Protected routes - authentication required
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/order-success",
        element: <OrderSuccessPage />,
      },
      {
        path: "/admin/discounts",
        element: <AdminDiscountPage />,
      },
      {
        path: "/admin/users",
        element: (
          <AdminLayout>
            <RequireAdmin>
              <UserManagement />
            </RequireAdmin>
          </AdminLayout>
        ),
      },

      // 404 Not Found - fallback route
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

/**
 * Route helpers
 */

/**
 * Get routes configuration
 * @returns {Array} Routes configuration array
 */
export const getRoutes = () => routes;

/**
 * Get path for a named route
 * @param {string} name - Route name
 * @param {Object} params - Route parameters (for dynamic routes)
 * @returns {string} Route path
 */
export const getRoutePath = (name, params = {}) => {
  const routePaths = {
    home: "/",
    products: "/products",
    productDetail: (slug) => `/products/${slug}`,
    category: (slug) => `/category/${slug}`,
    cart: "/cart",
    checkout: "/checkout",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: (token) => `/reset-password/${token}`,
    profile: "/profile",
    orders: "/orders",
    orderDetail: (id) => `/orders/${id}`,
  };

  // Get the route path (function or string)
  const path = routePaths[name];

  // If it's a function (dynamic route), call it with params
  if (typeof path === "function") {
    return path(params.slug || params.token || params.id);
  }

  // Otherwise return the static path
  return path;
};

export default routes;
