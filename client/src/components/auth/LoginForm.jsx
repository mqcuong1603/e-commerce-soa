import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Check role and redirect accordingly
        if (result.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setLoginError(result.error || "Login failed");
      }
    } catch (err) {
      setLoginError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow border-0">
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4 fw-bold">
          Login to Your Account
        </h2>

        {loginError && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {loginError}
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
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="password" className="form-label mb-0">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-decoration-none text-danger small"
              >
                <i className="bi bi-question-circle me-1"></i>Forgot password?
              </Link>
            </div>
            <div className="input-group mb-1">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
          </div>

          <div className="mb-4 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="remember"
              name="remember"
            />
            <label className="form-check-label" htmlFor="remember">
              Remember me
            </label>
          </div>

          <div className="d-grid mb-4">
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
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                </>
              )}
            </button>
          </div>

          <div className="text-center mb-4">
            <span className="text-muted">Don't have an account? </span>
            <Link
              to="/register"
              className="text-decoration-none text-danger fw-bold"
            >
              Create an account
            </Link>
          </div>

          <div className="position-relative my-4">
            <hr />
            <div className="position-absolute top-50 start-50 translate-middle px-3 bg-white">
              <span className="text-muted small">Or continue with</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-6">
              <a
                href={`${
                  process.env.REACT_APP_API_URL || "http://localhost:3000/api"
                }/auth/google`}
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-google me-2"></i>
                Google
              </a>
            </div>
            <div className="col-6">
              <a
                href={`${
                  process.env.REACT_APP_API_URL || "http://localhost:3000/api"
                }/auth/facebook`}
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-facebook me-2"></i>
                Facebook
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
