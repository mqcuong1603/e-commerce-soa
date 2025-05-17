import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AddressList from "../../components/user/AddressList";
import OrderHistory from "../../components/user/OrderHistory";
import userService from "../../services/user.service"; // Adjust this import based on your actual service path

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

        // Fetch loyalty points history
        fetchLoyaltyPointsHistory();
      }
    }
  }, [user]);

  // Fetch loyalty points history
  const fetchLoyaltyPointsHistory = async () => {
    try {
      setPointsHistoryLoading(true);
      setPointsHistoryError(null);

      const response = await userService.getLoyaltyPointsHistory({ limit: 5 });

      if (response.success) {
        setPointsHistory(response.data.pointsHistory);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Call your API to update the profile
      const response = await userService.updateProfile({
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
    return price?.toLocaleString("en-US") || "0";
  };

  return (
    <div className="container py-5">
      {/* Colorful Profile Header */}
      <div className="card border-0 shadow mb-5 bg-primary text-white">
        {/* Header content remains the same */}
        <div className="card-body p-5">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                {/* Avatar Circle */}
                <div
                  className="bg-white text-primary shadow rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i
                    className="bi bi-person-fill"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>

                {/* Profile Title */}
                <div className="ms-4">
                  <h1 className="display-6 fw-bold mb-0">My Profile</h1>
                  <p className="lead mb-0 opacity-75">
                    Manage your account settings
                  </p>
                </div>
              </div>
            </div>

            {/* Loyalty Points Badge */}
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <div className="bg-white bg-opacity-25 text-white d-inline-flex align-items-center rounded-pill px-3 py-2">
                <div className="bg-warning rounded-circle p-2 me-2">
                  <i className="bi bi-star-fill"></i>
                </div>
                <div>
                  <div className="fs-4 fw-bold">
                    {loyaltyPoints.loyaltyPoints} Points
                  </div>
                  <div className="small">
                    Worth ₫{formatPrice(loyaltyPoints.equivalentValue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left sidebar remains the same */}
        <div className="col-lg-3">
          {/* Navigation list remains the same */}
          {/* ... */}

          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            {/* Profile Card */}
            <div className="card-body p-4 text-center bg-gradient">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 p-4"
                style={{ width: "100px", height: "100px" }}
              >
                <span className="fw-bold" style={{ fontSize: "2.5rem" }}>
                  {profileData.firstName
                    ? profileData.firstName.charAt(0)
                    : "W"}
                </span>
              </div>
              <h5 className="fw-bold">Welcome Back!</h5>
              <p className="text-muted mb-0">Member since 2023</p>
            </div>

            {/* Navigation List */}
            <div className="list-group list-group-flush">
              <button
                onClick={() => setActiveTab("profile")}
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                  activeTab === "profile" ? "active bg-primary text-white" : ""
                }`}
              >
                <i
                  className={`bi bi-person-circle fs-4 me-3 ${
                    activeTab === "profile" ? "" : "text-primary"
                  }`}
                ></i>
                <span>Profile Information</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                  activeTab === "orders" ? "active bg-primary text-white" : ""
                }`}
              >
                <i
                  className={`bi bi-box-seam fs-4 me-3 ${
                    activeTab === "orders" ? "" : "text-primary"
                  }`}
                ></i>
                <span>My Orders</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                  activeTab === "addresses"
                    ? "active bg-primary text-white"
                    : ""
                }`}
              >
                <i
                  className={`bi bi-geo-alt fs-4 me-3 ${
                    activeTab === "addresses" ? "" : "text-primary"
                  }`}
                ></i>
                <span>My Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                  activeTab === "password" ? "active bg-primary text-white" : ""
                }`}
              >
                <i
                  className={`bi bi-shield-lock fs-4 me-3 ${
                    activeTab === "password" ? "" : "text-primary"
                  }`}
                ></i>
                <span>Change Password</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="list-group-item list-group-item-action d-flex align-items-center py-3 text-danger"
              >
                <i className="bi bi-box-arrow-right fs-4 me-3"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Promo Card */}
          <div className="card border-0 shadow-sm mt-4 bg-info text-white">
            <div className="card-body p-4 text-center">
              <i className="bi bi-gift-fill display-1 mb-3"></i>
              <h5 className="card-title fw-bold">Exclusive Offers</h5>
              <p className="card-text">
                Complete your profile to unlock special discounts!
              </p>
              <button className="btn btn-light text-info fw-bold">
                View Offers
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white p-4 border-0">
              <h4 className="mb-0 fw-bold">
                {activeTab === "profile" && (
                  <>
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Profile Information
                  </>
                )}
                {activeTab === "orders" && (
                  <>
                    <i className="bi bi-bag-check text-primary me-2"></i>My
                    Orders
                  </>
                )}
                {activeTab === "addresses" && (
                  <>
                    <i className="bi bi-pin-map text-primary me-2"></i>My
                    Addresses
                  </>
                )}
                {activeTab === "password" && (
                  <>
                    <i className="bi bi-key text-primary me-2"></i>Change
                    Password
                  </>
                )}
              </h4>
            </div>

            <div className="card-body p-4">
              {/* Profile Tab Content - UPDATED */}
              {activeTab === "profile" && (
                <div className="profile-tab">
                  {/* Success message */}
                  {successMessage && (
                    <div
                      className="alert alert-success alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {successMessage}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccessMessage("")}
                      ></button>
                    </div>
                  )}

                  {/* Error message */}
                  {errorMessage && (
                    <div
                      className="alert alert-danger alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {errorMessage}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setErrorMessage("")}
                      ></button>
                    </div>
                  )}

                  <div className="alert alert-info bg-info bg-opacity-10 border-0">
                    <div className="d-flex">
                      <div className="me-3">
                        <i className="bi bi-info-circle-fill text-info fs-4"></i>
                      </div>
                      <div>
                        <h5 className="alert-heading text-info">
                          Complete Your Profile
                        </h5>
                        <p className="mb-0">
                          Add your personal information to improve your shopping
                          experience and unlock special features.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form className="mt-4" onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          className="form-label fw-bold"
                          htmlFor="firstName"
                        >
                          First Name
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 text-primary">
                            <i className="bi bi-person"></i>
                          </span>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            className="form-control form-control-lg bg-light border-0"
                            placeholder="Your first name"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label
                          className="form-label fw-bold"
                          htmlFor="lastName"
                        >
                          Last Name
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 text-primary">
                            <i className="bi bi-person"></i>
                          </span>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            className="form-control form-control-lg bg-light border-0"
                            placeholder="Your last name"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold" htmlFor="email">
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 text-primary">
                            <i className="bi bi-envelope"></i>
                          </span>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            className="form-control form-control-lg bg-light border-0"
                            placeholder="Your email"
                            disabled
                          />
                        </div>
                        <div className="form-text">Email cannot be changed</div>
                      </div>

                      {/* REMOVE PHONE NUMBER FIELD
                      <div className="col-md-6">
                        <label htmlFor="phoneNumber" className="form-label fw-medium">
                          Phone Number
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 text-primary">
                            <i className="bi bi-telephone"></i>
                          </span>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber" 
                            value={profileData.phoneNumber}
                            onChange={handleInputChange}
                            className="form-control form-control-lg bg-light border-0"
                            placeholder="Your phone number"
                          />
                        </div>
                      </div> */}
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                      <button
                        type="submit"
                        className="btn btn-lg btn-primary px-5"
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
                            <i className="bi bi-check2-circle me-2"></i>Save
                            Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Rest of profile tab content remains the same */}
                  {/* Loyalty Points Section */}
                  <div className="mt-5 pt-4 border-top">
                    <h5 className="fw-bold d-flex align-items-center">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      Loyalty Points
                    </h5>

                    <div className="row g-4 mt-2">
                      {/* Points Summary Card */}
                      <div className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="card-title mb-0">
                                Available Points
                              </h6>
                              <span className="badge bg-warning text-dark rounded-pill">
                                Active
                              </span>
                            </div>

                            <div className="d-flex align-items-center">
                              <div className="display-4 fw-bold me-2">
                                {user?.loyaltyPoints || 0}
                              </div>
                              <div className="text-muted">points</div>
                            </div>

                            <div className="text-muted mt-2">
                              Worth ₫
                              {formatPrice((user?.loyaltyPoints || 0) * 1000)}
                            </div>

                            <hr className="my-3" />

                            <div className="d-flex justify-content-between align-items-center small">
                              <span>Conversion Rate</span>
                              <span className="fw-bold">1 point = ₫1,000</span>
                            </div>

                            <Link
                              to="/cart"
                              className="btn btn-primary mt-3 w-100"
                            >
                              <i className="bi bi-cart me-2"></i>
                              Use Points on Your Next Purchase
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* How It Works Card */}
                      <div className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm bg-light">
                          <div className="card-body p-4">
                            <h6 className="card-title fw-bold mb-3">
                              How Loyalty Points Work
                            </h6>

                            <ul className="list-group list-group-flush bg-transparent">
                              <li className="list-group-item bg-transparent px-0 d-flex border-0 pb-3">
                                <div className="me-3">
                                  <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    1
                                  </div>
                                </div>
                                <div>
                                  <strong>Earn Points</strong>
                                  <p className="text-muted mb-0 small">
                                    Get 10% of your purchase total in points
                                    when your orders are delivered
                                  </p>
                                </div>
                              </li>

                              <li className="list-group-item bg-transparent px-0 d-flex border-0 pb-3">
                                <div className="me-3">
                                  <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    2
                                  </div>
                                </div>
                                <div>
                                  <strong>Use Points</strong>
                                  <p className="text-muted mb-0 small">
                                    Apply points during checkout to reduce your
                                    total
                                  </p>
                                </div>
                              </li>

                              <li className="list-group-item bg-transparent px-0 d-flex border-0">
                                <div className="me-3">
                                  <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px" }}
                                  >
                                    3
                                  </div>
                                </div>
                                <div>
                                  <strong>Points Never Expire</strong>
                                  <p className="text-muted mb-0 small">
                                    Your earned points never expire, use them
                                    anytime
                                  </p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Loyalty Points History - NEW SECTION */}
                    <div className="mt-5 pt-4 border-top">
                      <h5 className="fw-bold d-flex align-items-center">
                        <i className="bi bi-clock-history text-primary me-2"></i>
                        Loyalty Points History
                      </h5>

                      {/* Loading Spinner */}
                      {pointsHistoryLoading && (
                        <div className="text-center py-4">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {pointsHistoryError && (
                        <div className="alert alert-danger text-center">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          {pointsHistoryError}
                        </div>
                      )}

                      {/* Points History Table */}
                      {!pointsHistoryLoading && !pointsHistoryError && (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                            <thead className="table-light">
                              <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Description</th>
                                <th scope="col" className="text-end">
                                  Points
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {pointsHistory.length === 0 && (
                                <tr>
                                  <td colSpan="3" className="text-center py-4">
                                    No loyalty points history found.
                                  </td>
                                </tr>
                              )}

                              {pointsHistory.map((entry, index) => (
                                <tr key={index}>
                                  <td>
                                    {new Date(entry.date).toLocaleDateString()}
                                  </td>
                                  <td>{entry.description}</td>
                                  <td className="text-end">
                                    {entry.points > 0 ? (
                                      <span className="text-success">
                                        +{entry.points}
                                      </span>
                                    ) : (
                                      <span className="text-danger">
                                        {entry.points}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Tab Content - UPDATED */}
              {activeTab === "password" && (
                <div className="password-tab">
                  {/* Success message */}
                  {passwordSuccessMessage && (
                    <div
                      className="alert alert-success alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {passwordSuccessMessage}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setPasswordSuccessMessage("")}
                      ></button>
                    </div>
                  )}

                  {/* Error message */}
                  {passwordErrorMessage && (
                    <div
                      className="alert alert-danger alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {passwordErrorMessage}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setPasswordErrorMessage("")}
                      ></button>
                    </div>
                  )}

                  <div className="alert alert-info bg-info bg-opacity-10 border-0">
                    <div className="d-flex">
                      <div className="me-3">
                        <i className="bi bi-shield-lock-fill text-info fs-4"></i>
                      </div>
                      <div>
                        <h5 className="alert-heading text-info">
                          Password Security
                        </h5>
                        <p className="mb-0">
                          Choose a strong password that you don't use for other
                          websites. Your password should be at least 6
                          characters long.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form className="mt-4" onSubmit={handlePasswordSubmit}>
                    <div className="row">
                      <div className="col-md-8 mx-auto">
                        <div className="mb-4">
                          <label
                            className="form-label fw-bold"
                            htmlFor="currentPassword"
                          >
                            Current Password
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0 text-primary">
                              <i className="bi bi-lock"></i>
                            </span>
                            <input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className="form-control form-control-lg bg-light border-0"
                              placeholder="Enter your current password"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label
                            className="form-label fw-bold"
                            htmlFor="newPassword"
                          >
                            New Password
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0 text-primary">
                              <i className="bi bi-lock"></i>
                            </span>
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="form-control form-control-lg bg-light border-0"
                              placeholder="Enter your new password"
                            />
                          </div>
                          <div className="form-text">
                            Password must be at least 6 characters long
                          </div>
                        </div>

                        <div className="mb-4">
                          <label
                            className="form-label fw-bold"
                            htmlFor="confirmPassword"
                          >
                            Confirm New Password
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0 text-primary">
                              <i className="bi bi-lock-fill"></i>
                            </span>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="form-control form-control-lg bg-light border-0"
                              placeholder="Confirm your new password"
                            />
                          </div>
                        </div>

                        <div className="d-flex flex-column align-items-center mt-5">
                          <button
                            type="submit"
                            className="btn btn-lg btn-primary px-5 mb-3"
                            disabled={isPasswordSubmitting}
                          >
                            {isPasswordSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Updating Password...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check2-circle me-2"></i>
                                Update Password
                              </>
                            )}
                          </button>

                          <div className="mt-4 pt-4 border-top text-center w-100">
                            <h6 className="fw-bold text-muted">
                              Forgot your current password?
                            </h6>
                            <Link
                              to="/forgot-password"
                              className="btn btn-outline-secondary mt-2"
                            >
                              <i className="bi bi-question-circle me-2"></i>
                              Reset Password
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Orders Tab Content */}
              {activeTab === "orders" && <OrderHistory />}

              {/* Addresses Tab Content */}
              {activeTab === "addresses" && <AddressList />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
