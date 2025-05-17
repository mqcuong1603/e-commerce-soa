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
      <div className="bg-light min-vh-100 py-5 d-flex align-items-center justify-content-center">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div
                  className="spinner-border text-primary"
                  style={{ width: 50, height: 50 }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="fw-bold mt-4 mb-2">
                  Validating Your Reset Link
                </h3>
                <p className="text-muted">
                  Please wait while we validate your password reset link...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Render invalid token message
  if (!tokenValid) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex align-items-center justify-content-center">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div
                  className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 80, height: 80 }}
                >
                  <i className="bi bi-exclamation-triangle fs-1"></i>
                </div>
                <h2 className="fw-bold mt-3">Invalid or Expired Link</h2>
                <p className="text-muted mb-4">
                  The password reset link is invalid or has expired. Please
                  request a new one.
                </p>
              </div>

              <div className="d-grid gap-2">
                <Link
                  to="/forgot-password"
                  className="btn btn-lg btn-primary fw-bold"
                >
                  <i className="bi bi-envelope me-2"></i>
                  Request New Reset Link
                </Link>
                <Link to="/login" className="btn btn-lg btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Render success message
  if (resetSuccess) {
    return (
      <div className="bg-light min-vh-100 py-5 d-flex align-items-center justify-content-center">
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <div
                  className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 80, height: 80 }}
                >
                  <i className="bi bi-check-lg fs-1"></i>
                </div>
                <h2 className="fw-bold mt-3">Password Reset Successful!</h2>
                <p className="text-muted mb-4">
                  Your password has been successfully reset. You can now log in
                  with your new password.
                </p>
              </div>

              <div className="d-grid">
                <button
                  className="btn btn-lg btn-primary fw-bold"
                  onClick={() => navigate("/login")}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login with New Password
                </button>
              </div>

              <div className="mt-4">
                <img
                  src="/images/placeholders/security-check.svg"
                  alt="Security Check"
                  className="img-fluid"
                  style={{ maxHeight: 150, opacity: 0.8 }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render password reset form
  return (
    <div className="bg-light min-vh-100 py-5 d-flex align-items-center justify-content-center">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card shadow border-0 rounded-4">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64 }}
              >
                <i className="bi bi-shield-lock fs-1"></i>
              </div>
              <h2 className="fw-bold mb-1">Reset Your Password</h2>
              <p className="text-muted mb-0">
                Create a new password for your account.
              </p>
            </div>

            {/* Form error message */}
            {errors.form && (
              <div
                className="alert alert-danger d-flex align-items-center mb-4"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{errors.form}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold">
                  New Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-primary">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`form-control form-control-lg bg-light border-0 ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-text">
                  Password must be at least 6 characters
                </div>
                {errors.password && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label fw-bold">
                  Confirm New Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-primary">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`form-control form-control-lg bg-light border-0 ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn btn-lg btn-primary fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat me-2"></i>Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="text-decoration-none text-primary fw-bold"
              >
                <i className="bi bi-arrow-left me-1"></i>Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
