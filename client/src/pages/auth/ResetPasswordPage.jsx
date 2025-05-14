import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../../services/auth.service";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";

/**
 * ResetPasswordPage component
 * Allows users to reset their password using a token from the email link
 */
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // State variables
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    // In a real application, we would validate the token against the backend
    // Here we're just simulating the validation
    const validateToken = async () => {
      try {
        setValidatingToken(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Assume token is valid if it's at least 20 characters long
        // In a real app, this would be a server-side validation
        if (token && token.length >= 20) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear error when user types
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    // Clear error when user types
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await authService.resetPassword(token, password);

      if (response.success) {
        // Password reset successful
        setResetSuccess(true);
      } else {
        // Handle API error
        setErrors({
          form:
            response.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrors({
        form: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render loading state while validating token
  if (validatingToken) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card padding="large" className="text-center">
            <Loader text="Validating your reset link..." />
          </Card>
        </div>
      </div>
    );
  }

  // Render invalid token message
  if (!tokenValid) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card padding="large" className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <div className="flex flex-col space-y-4">
              <Link
                to="/forgot-password"
                className="w-full text-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="w-full text-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render success message
  if (resetSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card padding="large" className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/login")}
            >
              Login with New Password
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Render password reset form
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Reset Your Password
        </h1>

        <Card padding="large">
          {/* Form error message */}
          {errors.form && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <span className="block sm:inline">{errors.form}</span>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Create a new password for your account. Choose a strong password
            that you don't use for other websites.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
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
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth={true}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
