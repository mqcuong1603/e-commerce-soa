import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  // Get redirect path from location state or default to homepage
  const from = location.state?.from?.pathname || "/";

  // Check for success message in location state (e.g., from registration)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);

      // Clear the success message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          {successMessage && (
            <div
              className="alert alert-success alert-dismissible fade show mb-4"
              role="alert"
            >
              {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          <LoginForm />

          <div className="mt-4 text-center">
            <p className="text-muted small">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-decoration-none">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-decoration-none">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
