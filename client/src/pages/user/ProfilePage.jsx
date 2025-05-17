import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AddressList from "../../components/user/AddressList";
// import OrderHistory from "../../components/user/OrderHistory";
import userService from "../../services/user.service";
// import "bootstrap/dist/css/bootstrap.min.css"; // Already globally imported or via index.js
// import "bootstrap-icons/font/bootstrap-icons.css"; // Already globally imported or via index.js
// import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Already globally imported or via index.js

const ProfilePage = () => {
  const { user, logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    loyaltyPoints: 0,
    equivalentValue: 0,
  });
  const [pointsHistory, setPointsHistory] = useState([]);
  const [pointsHistoryLoading, setPointsHistoryLoading] = useState(false);
  const [pointsHistoryError, setPointsHistoryError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Or any other number you prefer

  // Add state for form data
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Add password change form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Add state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      // Parse name into first and last name if it comes as full name
      const nameParts = user.fullName ? user.fullName.split(" ") : ["", ""];
      const firstName = user.firstName || nameParts[0] || "";
      const lastName =
        user.lastName ||
        (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "") ||
        "";

      setProfileData({
        firstName,
        lastName,
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });

      // Load loyalty points if available
      if (user.loyaltyPoints) {
        setLoyaltyPoints({
          loyaltyPoints: user.loyaltyPoints || 0,
          equivalentValue: (user.loyaltyPoints || 0) * 1000, // Assuming 1 point = 1000₫
        });

        // Fetch loyalty points history for the initial page
        fetchLoyaltyPointsHistory(currentPage);
      }
    }
  }, [user]); // Removed currentPage from dependency array to prevent re-fetch on page change before user interaction

  // Fetch loyalty points history
  const fetchLoyaltyPointsHistory = async (page) => {
    try {
      setPointsHistoryLoading(true);
      setPointsHistoryError(null);

      const response = await userService.getLoyaltyPointsHistory({
        page,
        limit: itemsPerPage,
      });

      if (response.success && response.data) {
        const rawHistory = response.data.pointsHistory || [];
        const processedHistory = [];
        rawHistory.forEach((order) => {
          if (order.loyaltyPointsEarned > 0) {
            processedHistory.push({
              id: `${order._id}-earned`, // Unique key for React
              date: order.createdAt,
              description: `Points earned from order #${order.orderNumber}`,
              points: order.loyaltyPointsEarned,
            });
          }
          if (order.loyaltyPointsUsed > 0) {
            processedHistory.push({
              id: `${order._id}-used`, // Unique key for React
              date: order.createdAt,
              description: `Points used on order #${order.orderNumber}`,
              points: -order.loyaltyPointsUsed, // Store used points as negative
            });
          }
        });

        // Sort by date descending if combining earned/used from same order might change order
        processedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        setPointsHistory(processedHistory);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        throw new Error(
          response.message || "Failed to fetch loyalty points history"
        );
      }
    } catch (error) {
      console.error("Error fetching loyalty points history:", error);
      setPointsHistoryError("Could not load loyalty points history");
    } finally {
      setPointsHistoryLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error message when user starts typing
    setPasswordErrorMessage("");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLoyaltyPointsHistory(newPage);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Call your API to update the profile
      const response = await userService.updateUserProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
      });

      if (response.success) {
        setSuccessMessage("Profile updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordSubmitting(true);
    setPasswordSuccessMessage("");
    setPasswordErrorMessage("");

    // Validate form
    if (!passwordData.currentPassword) {
      setPasswordErrorMessage("Current password is required");
      setIsPasswordSubmitting(false);
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordErrorMessage("New password is required");
      setIsPasswordSubmitting(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordErrorMessage("New password must be at least 6 characters");
      setIsPasswordSubmitting(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrorMessage("Passwords do not match");
      setIsPasswordSubmitting(false);
      return;
    }

    try {
      // Call auth context function to update password
      const response = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setPasswordSuccessMessage("Password updated successfully!");
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (error) {
      setPasswordErrorMessage(
        error.message || "An error occurred. Please try again."
      );
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // Format price helper function
  const formatPrice = (price) => {
    return (
      price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
      "0 đ"
    );
  };

  const handleSidebarNavigation = (tabId) => {
    if (tabId === "orders") {
      navigate("/orders");
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <>
      <div className="container mt-5 mb-5">
        {/* Profile Header */}
        <div
          className="card border-0 shadow-lg mb-5 rounded-4 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="card-body p-lg-5 p-4 text-white">
            <div className="row align-items-center">
              <div className="col-lg-8 col-md-7">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-white text-primary shadow-sm rounded-circle p-3 d-flex align-items-center justify-content-center me-sm-4 me-3 flex-shrink-0"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <i
                      className="bi bi-person-fill"
                      style={{ fontSize: "3.5rem" }}
                    ></i>
                  </div>
                  <div>
                    <h1 className="display-5 fw-bold mb-1">
                      {profileData.firstName || profileData.lastName
                        ? `${profileData.firstName} ${profileData.lastName}`
                        : user?.fullName || "Welcome"}
                    </h1>
                    <p className="lead mb-0 opacity-75 fs-6">
                      Manage your account, orders, and preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-5 text-md-end mt-4 mt-md-0">
                <div className="bg-white bg-opacity-25 rounded-pill p-3 d-inline-flex align-items-center shadow-sm">
                  <div className="bg-warning rounded-circle p-2 me-2 d-flex align-items-center justify-content-center">
                    <i className="bi bi-star-fill fs-5 text-dark"></i>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">
                      {loyaltyPoints.loyaltyPoints}
                    </div>
                    <div className="small opacity-75">Loyalty Points</div>
                  </div>
                </div>
                <div className="small mt-2 opacity-75">
                  Worth {formatPrice(loyaltyPoints.equivalentValue)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-lg-5 g-4">
          {/* Left Sidebar Navigation */}
          <div className="col-lg-3">
            <div
              className="d-flex flex-column sticky-sidebar"
              style={{
                position: "sticky",
                top: "100px", // Reduced to account for new header transition
                maxHeight: "calc(100vh - 120px)", // Max height based on viewport
                overflowY: "auto", // Allow scrolling if content is too tall
                zIndex: "10", // Higher z-index to prevent overlap issues
              }}
            >
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 transition-all hover-card">
                <div className="list-group list-group-flush">
                  {/*
                  { id: "profile", label: "Profile Information", icon: "bi-person-lines-fill" },
                  { id: "orders", label: "My Orders", icon: "bi-box-seam" },
                  { id: "addresses", label: "My Addresses", icon: "bi-geo-alt" },
                  { id: "password", label: "Change Password", icon: "bi-shield-lock" },
                */}
                  {/*
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`list-group-item list-group-item-action d-flex align-items-center py-3 px-4 border-0 fw-medium ${
                      activeTab === item.id
                        ? "active text-white"
                        : "text-secondary"
                    }`}
                    style={ activeTab === item.id ? {background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"} : {}}
                  >
                    <i className={`bi ${item.icon} fs-4 me-3`}></i>
                    <span>{item.label}</span>
                    {activeTab === item.id && <i className="bi bi-arrow-right-short ms-auto fs-4"></i>}
                  </button>
                */}
                  {/*
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="list-group-item list-group-item-action d-flex align-items-center py-3 px-4 border-0 fw-medium text-danger"
                >
                  <i className="bi bi-box-arrow-right fs-4 me-3"></i>
                  <span>Logout</span>
                </button>
                */}
                  {[
                    {
                      id: "profile",
                      label: "Profile Information",
                      icon: "bi-person-lines-fill",
                    },
                    // Update the "My Orders" item to navigate, not just set activeTab
                    {
                      id: "orders",
                      label: "My Orders",
                      icon: "bi-box-seam",
                      action: () => navigate("/orders"), // Add navigation action
                    },
                    {
                      id: "addresses",
                      label: "My Addresses",
                      icon: "bi-geo-alt",
                    },
                    {
                      id: "password",
                      label: "Change Password",
                      icon: "bi-shield-lock",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarNavigation(item.id)} // Use the new handler
                      className={`list-group-item list-group-item-action d-flex align-items-center py-3 px-4 border-0 fw-medium transition-all ${
                        activeTab === item.id && item.id !== "orders" // Keep active state for non-order tabs
                          ? "active text-white"
                          : "text-secondary hover-item"
                      }`}
                      style={
                        activeTab === item.id && item.id !== "orders"
                          ? {
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }
                          : {}
                      }
                    >
                      <i className={`bi ${item.icon} fs-4 me-3`}></i>
                      <span>{item.label}</span>
                      {activeTab === item.id && item.id !== "orders" && (
                        <i className="bi bi-arrow-right-short ms-auto fs-4"></i>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="list-group-item list-group-item-action d-flex align-items-center py-3 px-4 border-0 fw-medium text-danger transition-all hover-item"
                  >
                    <i className="bi bi-box-arrow-right fs-4 me-3"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Optional: Promo Card or Quick Links */}
              <div
                className="card border-0 shadow-sm rounded-4 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)",
                }}
              >
                <div className="card-body p-4 text-center">
                  <i className="bi bi-patch-check-fill display-3 mb-3 text-success"></i>
                  <h5 className="card-title fw-bold text-dark">
                    Account Verified
                  </h5>
                  <p className="card-text text-muted small">
                    Your account is secure and up-to-date. Explore new arrivals!
                  </p>
                  <Link to="/products" className="btn btn-dark btn-sm mt-2">
                    Shop Now <i className="bi bi-arrow-right-short"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-light p-4 border-bottom-0">
                <h4 className="mb-0 fw-bold text-primary d-flex align-items-center">
                  {activeTab === "profile" && (
                    <>
                      <i className="bi bi-person-badge-fill me-2"></i> Profile
                      Details
                    </>
                  )}
                  {/* Remove Order History title from here, it will be on its own page */}
                  {activeTab === "addresses" && (
                    <>
                      <i className="bi bi-pin-map-fill me-2"></i> Saved
                      Addresses
                    </>
                  )}
                  {activeTab === "password" && (
                    <>
                      <i className="bi bi-key-fill me-2"></i> Security Settings
                    </>
                  )}
                </h4>
              </div>

              <div className="card-body p-lg-5 p-4">
                {/* Profile Tab Content */}
                {activeTab === "profile" && (
                  <div className="profile-tab">
                    {successMessage && (
                      <div
                        className="alert alert-success d-flex align-items-center"
                        role="alert"
                      >
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{successMessage}</div>
                        <button
                          type="button"
                          className="btn-close ms-auto"
                          onClick={() => setSuccessMessage("")}
                        ></button>
                      </div>
                    )}
                    {errorMessage && (
                      <div
                        className="alert alert-danger d-flex align-items-center"
                        role="alert"
                      >
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{errorMessage}</div>
                        <button
                          type="button"
                          className="btn-close ms-auto"
                          onClick={() => setErrorMessage("")}
                        ></button>
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmit}
                      className="needs-validation"
                      noValidate
                    >
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label
                            htmlFor="firstName"
                            className="form-label fw-medium"
                          >
                            First Name
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-person text-primary"></i>
                            </span>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={profileData.firstName}
                              onChange={handleInputChange}
                              className="form-control border-start-0"
                              placeholder="e.g., John"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="lastName"
                            className="form-label fw-medium"
                          >
                            Last Name
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-person text-primary"></i>
                            </span>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={profileData.lastName}
                              onChange={handleInputChange}
                              className="form-control border-start-0"
                              placeholder="e.g., Doe"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="email"
                            className="form-label fw-medium"
                          >
                            Email Address
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-light border-end-0">
                              <i className="bi bi-envelope-fill text-primary"></i>
                            </span>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={profileData.email}
                              className="form-control border-start-0"
                              disabled
                            />
                          </div>
                          <div className="form-text small text-muted">
                            Email cannot be changed.
                          </div>
                        </div>
                        {/* Phone number field removed from here */}
                      </div>
                      <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5 rounded-pill"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-save-fill me-2"></i>Save
                              Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Loyalty Points Section */}
                    <div className="mt-5 pt-4 border-top">
                      <h5 className="fw-bold d-flex align-items-center mb-4">
                        <i className="bi bi-award-fill text-warning me-2 fs-4"></i>
                        Loyalty Program
                      </h5>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="card h-100 border-0 shadow-sm rounded-3 bg-light">
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="card-title mb-0 text-primary fw-semibold">
                                  Your Points Balance
                                </h6>
                                <span className="badge bg-success-subtle text-success-emphasis rounded-pill">
                                  Active
                                </span>
                              </div>
                              <div className="d-flex align-items-baseline mb-1">
                                <div className="display-4 fw-bold text-primary me-2">
                                  {user?.loyaltyPoints || 0}
                                </div>
                                <div className="text-muted">points</div>
                              </div>
                              <div className="text-muted small mb-3">
                                Equivalent to{" "}
                                {formatPrice((user?.loyaltyPoints || 0) * 1000)}
                              </div>
                              <hr />
                              <div className="d-flex justify-content-between align-items-center small text-muted mt-2">
                                <span>Conversion:</span>
                                <span className="fw-bold">
                                  1 point = 1,000 đ
                                </span>
                              </div>
                              <Link
                                to="/cart"
                                className="btn btn-warning mt-3 w-100 fw-semibold rounded-pill"
                              >
                                <i className="bi bi-cart-plus-fill me-2"></i>Use
                                Points at Checkout
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card h-100 border-0 shadow-sm rounded-3">
                            <div className="card-body p-4">
                              <h6 className="card-title fw-bold mb-3 text-primary">
                                How It Works
                              </h6>
                              <ul className="list-unstyled">
                                <li className="d-flex mb-3">
                                  <div
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    1
                                  </div>
                                  <div>
                                    <strong className="d-block">
                                      Earn Points:
                                    </strong>
                                    <span className="text-muted small">
                                      Get 10% of your purchase total in points.
                                    </span>
                                  </div>
                                </li>
                                <li className="d-flex mb-3">
                                  <div
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    2
                                  </div>
                                  <div>
                                    <strong className="d-block">
                                      Use Points:
                                    </strong>
                                    <span className="text-muted small">
                                      Apply points during checkout to save.
                                    </span>
                                  </div>
                                </li>
                                <li className="d-flex">
                                  <div
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    3
                                  </div>
                                  <div>
                                    <strong className="d-block">
                                      No Expiry:
                                    </strong>
                                    <span className="text-muted small">
                                      Your points never expire.
                                    </span>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Loyalty Points History */}
                      <div className="mt-5 pt-4 border-top">
                        <h5 className="fw-bold d-flex align-items-center mb-3">
                          <i className="bi bi-hourglass-split text-primary me-2 fs-4"></i>
                          Points Transaction History
                        </h5>
                        {pointsHistoryLoading && (
                          <div className="text-center py-5">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        )}
                        {pointsHistoryError && (
                          <div className="alert alert-warning text-center">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            {pointsHistoryError}
                          </div>
                        )}
                        {!pointsHistoryLoading && !pointsHistoryError && (
                          <>
                            {pointsHistory.length === 0 ? (
                              <div className="text-center py-4 text-muted">
                                <i className="bi bi-journal-x fs-1 mb-2 d-block"></i>
                                No points transactions yet.
                              </div>
                            ) : (
                              <div className="table-responsive shadow-sm rounded-3">
                                <table
                                  className="table table-hover align-middle mb-0"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  <thead className="table-light">
                                    <tr>
                                      <th scope="col" className="py-3 px-4">
                                        Date
                                      </th>
                                      <th scope="col" className="py-3 px-4">
                                        Description
                                      </th>
                                      <th
                                        scope="col"
                                        className="text-end py-3 px-4"
                                      >
                                        Points
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pointsHistory.map((entry) => (
                                      <tr key={entry.id}>
                                        <td className="py-3 px-4">
                                          {new Date(
                                            entry.date
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </td>
                                        <td className="py-3 px-4">
                                          {entry.description}
                                        </td>
                                        <td
                                          className={`text-end fw-semibold py-3 px-4 ${
                                            entry.points > 0
                                              ? "text-success"
                                              : "text-danger"
                                          }`}
                                        >
                                          {entry.points > 0 ? "+" : ""}
                                          {entry.points}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {totalPages > 1 && (
                              <nav
                                aria-label="Loyalty points history pagination"
                                className="mt-4 d-flex justify-content-center"
                              >
                                <ul className="pagination pagination-sm">
                                  <li
                                    className={`page-item ${
                                      currentPage === 1 ? "disabled" : ""
                                    }`}
                                  >
                                    <button
                                      className="page-link"
                                      onClick={() =>
                                        handlePageChange(currentPage - 1)
                                      }
                                      disabled={currentPage === 1}
                                    >
                                      &laquo; Prev
                                    </button>
                                  </li>
                                  {[...Array(totalPages).keys()].map((num) => (
                                    <li
                                      key={num + 1}
                                      className={`page-item ${
                                        currentPage === num + 1 ? "active" : ""
                                      }`}
                                    >
                                      <button
                                        className="page-link"
                                        onClick={() =>
                                          handlePageChange(num + 1)
                                        }
                                      >
                                        {num + 1}
                                      </button>
                                    </li>
                                  ))}
                                  <li
                                    className={`page-item ${
                                      currentPage === totalPages
                                        ? "disabled"
                                        : ""
                                    }`}
                                  >
                                    <button
                                      className="page-link"
                                      onClick={() =>
                                        handlePageChange(currentPage + 1)
                                      }
                                      disabled={currentPage === totalPages}
                                    >
                                      Next &raquo;
                                    </button>
                                  </li>
                                </ul>
                              </nav>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Tab Content */}
                {activeTab === "password" && (
                  <div className="password-tab">
                    {passwordSuccessMessage && (
                      <div
                        className="alert alert-success d-flex align-items-center"
                        role="alert"
                      >
                        <i className="bi bi-shield-check-fill me-2"></i>
                        <div>{passwordSuccessMessage}</div>
                        <button
                          type="button"
                          className="btn-close ms-auto"
                          onClick={() => setPasswordSuccessMessage("")}
                        ></button>
                      </div>
                    )}
                    {passwordErrorMessage && (
                      <div
                        className="alert alert-danger d-flex align-items-center"
                        role="alert"
                      >
                        <i className="bi bi-shield-exclamation-fill me-2"></i>
                        <div>{passwordErrorMessage}</div>
                        <button
                          type="button"
                          className="btn-close ms-auto"
                          onClick={() => setPasswordErrorMessage("")}
                        ></button>
                      </div>
                    )}

                    <div className="alert alert-info bg-info bg-opacity-10 border-info border-opacity-25 rounded-3 mb-4">
                      <div className="d-flex">
                        <div className="me-3 pt-1">
                          <i className="bi bi-lightbulb-fill text-info fs-4"></i>
                        </div>
                        <div>
                          <h5 className="alert-heading text-info fw-semibold">
                            Password Security Tips
                          </h5>
                          <ul className="list-unstyled mb-0 small text-muted">
                            <li>
                              <i className="bi bi-check-circle me-1 text-success"></i>
                              Use a strong, unique password.
                            </li>
                            <li>
                              <i className="bi bi-check-circle me-1 text-success"></i>
                              Minimum 6 characters, include numbers or symbols.
                            </li>
                            <li>
                              <i className="bi bi-check-circle me-1 text-success"></i>
                              Change your password regularly.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={handlePasswordSubmit}
                      className="needs-validation"
                      noValidate
                    >
                      <div className="row justify-content-center">
                        <div className="col-lg-8">
                          <div className="mb-4">
                            <label
                              htmlFor="currentPassword"
                              className="form-label fw-medium"
                            >
                              Current Password
                            </label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-unlock-fill text-primary"></i>
                              </span>
                              <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="form-control border-start-0"
                                placeholder="Enter current password"
                                required
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="newPassword"
                              className="form-label fw-medium"
                            >
                              New Password
                            </label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-lock-fill text-primary"></i>
                              </span>
                              <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="form-control border-start-0"
                                placeholder="Enter new password"
                                required
                                minLength="6"
                              />
                            </div>
                            <div className="form-text small text-muted">
                              Minimum 6 characters.
                            </div>
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="confirmPassword"
                              className="form-label fw-medium"
                            >
                              Confirm New Password
                            </label>
                            <div className="input-group input-group-lg">
                              <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-check-lg text-primary"></i>
                              </span>
                              <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="form-control border-start-0"
                                placeholder="Confirm new password"
                                required
                              />
                            </div>
                          </div>
                          <div className="d-grid mt-4 pt-3 border-top">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg rounded-pill shadow-sm hover-lift"
                              disabled={isPasswordSubmitting}
                            >
                              {isPasswordSubmitting ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-shield-lock-fill me-2"></i>
                                  Update Password
                                </>
                              )}
                            </button>
                          </div>
                          {/* Removed "Forgot your password?" link from here as it's not typical for a change password form when logged in */}
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Addresses Tab Content */}
                {activeTab === "addresses" && (
                  <div className="addresses-tab">
                    <AddressList />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .transition-all {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12) !important;
        }
        .hover-item:hover {
          background-color: rgba(102, 126, 234, 0.1);
          color: #667eea !important;
        }
        .sticky-sidebar {
          transition: top 0.3s ease;
        }
        @media (max-width: 992px) {
          .sticky-sidebar {
            position: relative !important;
          }
        }
      `}</style>
    </>
  );
};

export default ProfilePage;
