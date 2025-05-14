import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import userService from "../services/user.service";
import AddressList from "../components/user/AddressList";
import OrderHistory from "../components/user/OrderHistory";
import UserProfile from "../components/user/UserProfile";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";

/**
 * Profile Page component
 * Displays user profile information and management options
 */
const ProfilePage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(null);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/profile" } },
        replace: true,
      });
    } else {
      fetchUserData();
    }
  }, [isAuthenticated, navigate]);

  // Fetch user data on component mount
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch loyalty points
      const pointsResponse = await userService.getLoyaltyPoints();
      if (pointsResponse.success) {
        setLoyaltyPoints(pointsResponse.data);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format loyalty points value
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loader text="Loading profile..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button
            onClick={fetchUserData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left sidebar - Profile sections */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* User info */}
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 rounded-full p-6 flex items-center justify-center">
                <span className="text-primary-600 text-2xl font-bold">
                  {user?.fullName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-gray-600 text-sm">{user?.email || ""}</p>
              </div>
            </div>

            {/* Loyalty points card (if available) */}
            {loyaltyPoints && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Your Loyalty Points
                </h3>
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-3 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {loyaltyPoints.loyaltyPoints} Points
                    </div>
                    <div className="text-sm text-green-700">
                      Worth ₫{formatPrice(loyaltyPoints.equivalentValue)} on
                      your next purchase
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                  activeTab === "profile"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile Information
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                  activeTab === "orders"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                My Orders
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                  activeTab === "addresses"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                My Addresses
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                  activeTab === "password"
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Change Password
              </button>
            </nav>

            {/* Logout button */}
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Button>
            </div>
          </div>

          {/* Help and support */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/contact"
                  className="text-primary-600 hover:text-primary-800"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-primary-600 hover:text-primary-800"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  className="text-primary-600 hover:text-primary-800"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-primary-600 hover:text-primary-800"
                >
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main content area */}
        <div className="w-full md:w-3/4">
          {/* Profile tab */}
          {activeTab === "profile" && <UserProfile />}

          {/* Orders tab */}
          {activeTab === "orders" && <OrderHistory />}

          {/* Addresses tab */}
          {activeTab === "addresses" && <AddressList />}

          {/* Password tab */}
          {activeTab === "password" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Change Password</h2>
              <form className="space-y-6">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary">
                    Update Password
                  </Button>
                </div>
              </form>

              {/* Password Recovery */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Forgot Password?
                </h3>
                <p className="text-gray-600 mb-4">
                  If you've forgotten your current password, you can use the
                  password recovery option.
                </p>
                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Reset your password
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
