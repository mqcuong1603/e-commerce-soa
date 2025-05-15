import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/user.service";
import AddressList from "../../components/user/AddressList";
import OrderHistory from "../../components/user/OrderHistory";
import UserProfile from "../../components/user/UserProfile";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

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
      <div className="container py-5">
        <Loader text="Loading profile..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <p>{error}</p>
          <button onClick={fetchUserData} className="btn btn-danger mt-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Left sidebar - Profile sections */}
        <div className="col-md-4 col-lg-3">
          <div className="card shadow mb-4">
            <div className="card-body">
              {/* User info */}
              <div className="d-flex align-items-center mb-4">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <span className="text-primary fs-4 fw-bold">
                    {user?.fullName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="ms-3">
                  <h2 className="fs-5 fw-bold mb-0">
                    {user?.fullName || "User"}
                  </h2>
                  <p className="text-muted small mb-0">{user?.email || ""}</p>
                </div>
              </div>

              {/* Loyalty points card (if available) */}
              {loyaltyPoints && (
                <div className="card bg-success bg-opacity-10 border-success border-opacity-25 mb-4">
                  <div className="card-body">
                    <h3 className="fs-5 fw-semibold text-success mb-2">
                      Your Loyalty Points
                    </h3>
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-25 rounded-circle p-2 me-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          className="text-success"
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
                        <div className="fs-4 fw-bold text-success">
                          {loyaltyPoints.loyaltyPoints} Points
                        </div>
                        <div className="small text-success">
                          Worth ₫{formatPrice(loyaltyPoints.equivalentValue)} on
                          your next purchase
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation menu */}
              <div className="list-group list-group-flush border-0 mb-4">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${
                    activeTab === "profile"
                      ? "bg-primary bg-opacity-10 text-primary"
                      : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="me-2"
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
                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${
                    activeTab === "orders"
                      ? "bg-primary bg-opacity-10 text-primary"
                      : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="me-2"
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
                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${
                    activeTab === "addresses"
                      ? "bg-primary bg-opacity-10 text-primary"
                      : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="me-2"
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
                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${
                    activeTab === "password"
                      ? "bg-primary bg-opacity-10 text-primary"
                      : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="me-2"
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
              </div>

              {/* Logout button */}
              <div className="pt-3 border-top">
                <button
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center w-100"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="me-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Help and support */}
          <div className="card shadow">
            <div className="card-body">
              <h3 className="fs-5 fw-semibold mb-3">Need Help?</h3>
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link
                    to="/contact"
                    className="nav-link text-primary px-0 py-1"
                  >
                    Contact Support
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/faq" className="nav-link text-primary px-0 py-1">
                    FAQs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/shipping-policy"
                    className="nav-link text-primary px-0 py-1"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/returns"
                    className="nav-link text-primary px-0 py-1"
                  >
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="col-md-8 col-lg-9">
          {/* Profile tab */}
          {activeTab === "profile" && <UserProfile />}

          {/* Orders tab */}
          {activeTab === "orders" && <OrderHistory />}

          {/* Addresses tab */}
          {activeTab === "addresses" && <AddressList />}

          {/* Password tab */}
          {activeTab === "password" && (
            <div className="card shadow">
              <div className="card-body">
                <h2 className="fs-4 fw-bold mb-4">Change Password</h2>
                <form className="mb-4">
                  {/* Current Password */}
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                    />
                  </div>

                  {/* New Password */}
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                    />
                    <div className="form-text text-muted">
                      Password must be at least 6 characters
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </form>

                {/* Password Recovery */}
                <div className="border-top pt-4 mt-4">
                  <h3 className="fs-5 fw-semibold mb-3">Forgot Password?</h3>
                  <p className="text-muted mb-3">
                    If you've forgotten your current password, you can use the
                    password recovery option.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="btn btn-outline-primary"
                  >
                    Reset your password
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
