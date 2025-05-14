import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/auth.service";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSubmitted(true);
      } else {
        setError(
          response.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow border-0">
      <div className="card-body p-4">
        {submitted ? (
          <div className="text-center py-4">
            <div className="mb-4">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "3.5rem" }}
              ></i>
            </div>
            <h2 className="fs-4 fw-bold mb-3">Check Your Email</h2>
            <p className="mb-3">
              We've sent a password reset link to: <strong>{email}</strong>
            </p>
            <p className="text-muted small mb-4">
              If you don't receive an email within a few minutes, please check
              your spam folder or try again.
            </p>
            <div className="d-grid gap-2">
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-outline-danger"
              >
                Try Again
              </button>
              <Link to="/login" className="btn btn-light">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="card-title text-center mb-3 fw-bold">
              Reset Your Password
            </h2>

            <p className="card-text text-muted mb-4 text-center">
              Enter your email address to receive a password reset link
            </p>

            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group mb-1">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-decoration-none text-danger">
                  <i className="bi bi-arrow-left me-1"></i> Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
