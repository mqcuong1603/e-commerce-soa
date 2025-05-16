import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AddressList from "../../components/user/AddressList";
import OrderHistory from "../../components/user/OrderHistory";
import userService from "../../services/user.service"; // Adjust this import based on your actual service path

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    loyaltyPoints: 0,
    equivalentValue: 0,
  });

  // Add state for form data
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Add state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      }
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                  <div className="mt-5 pt-4 border-top">{/* ... */}</div>
                </div>
              )}

              {/* Password Tab Content remains the same */}
              {activeTab === "password" && <form>{/* ... */}</form>}

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
