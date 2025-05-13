import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/user.service";
import Button from "../ui/Button";
import AddressList from "./AddressList";

/**
 * User profile component with profile details and management
 */
const UserProfile = () => {
  const { user, logout, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch loyalty points on component mount
  useEffect(() => {
    fetchLoyaltyPoints();
  }, []);

  // Fetch user loyalty points from API
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await userService.getLoyaltyPoints();

      if (response.success) {
        setLoyaltyPoints(response.data);
      }
    } catch (err) {
      console.error("Error fetching loyalty points:", err);
    }
  };

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous errors/success
    setProfileError(null);
    setProfileSuccess(null);
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous errors/success
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate profile data
    if (!profileData.fullName.trim()) {
      setProfileError("Full name is required");
      return;
    }

    try {
      setLoading(true);
      setProfileError(null);

      const response = await userService.updateUserProfile(profileData);

      if (response.success) {
        setProfileSuccess("Profile updated successfully");
        // Update local user data
        // This would typically be handled by the AuthContext
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError(
        err.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Validate password data
    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setPasswordError(null);

      const response = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setPasswordSuccess("Password updated successfully");
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(
        err.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Deactivate account
  const handleDeactivateAccount = async () => {
    try {
      setLoading(true);

      const response = await userService.deactivateAccount();

      if (response.success) {
        // Log out the user
        logout();
        navigate("/");
      } else {
        throw new Error(response.message || "Failed to deactivate account");
      }
    } catch (err) {
      console.error("Error deactivating account:", err);
      setProfileError(
        err.message || "Failed to deactivate account. Please try again."
      );
    } finally {
      setLoading(false);
      setShowDeactivateConfirm(false);
    }
  };

  // Format loyalty points value
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Render email in a safe way (hide part of it)
  const renderEmail = (email) => {
    if (!email) return "";

    const parts = email.split("@");
    if (parts.length !== 2) return email;

    const username = parts[0];
    const domain = parts[1];

    // Show first 3 characters and last character of username, hide the rest
    const hiddenUsername =
      username.length <= 4
        ? username
        : `${username.substring(0, 3)}${"*".repeat(
            username.length - 4
          )}${username.substring(username.length - 1)}`;

    return `${hiddenUsername}@${domain}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Profile tabs */}
      <div className="border-b">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "profile"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "password"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "addresses"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("addresses")}
          >
            My Addresses
          </button>
        </nav>
      </div>

      {/* Profile content */}
      <div className="p-6">
        {/* Profile Information */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>

            {/* Loyalty Points */}
            {loyaltyPoints && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
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

            {/* Error/Success messages */}
            {profileError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {profileSuccess}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email ? renderEmail(user.email) : ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Saving..." : "Update Profile"}
                </Button>
              </div>
            </form>

            {/* Account Deactivation */}
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Management
              </h3>

              {showDeactivateConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-2">
                    Deactivate Account?
                  </h4>
                  <p className="text-red-700 mb-4">
                    This action cannot be undone. Your account will be
                    deactivated and you will be logged out.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => setShowDeactivateConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleDeactivateAccount}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Confirm Deactivation"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeactivateConfirm(true)}
                >
                  Deactivate Account
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Change Password */}
        {activeTab === "password" && (
          <div>
            <h2 className="text-xl font-bold mb-6">Change Password</h2>

            {/* Error/Success messages */}
            {passwordError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {passwordSuccess}
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-6">
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
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
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
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
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
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
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

        {/* Addresses */}
        {activeTab === "addresses" && (
          <div>
            <AddressList />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
