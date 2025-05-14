import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { useAuth } from "../../contexts/AuthContext";

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle registration errors
  const handleRegistrationError = (errorMessage) => {
    setError(errorMessage);
    // Scroll to top to show the error
    window.scrollTo(0, 0);
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h1 className="text-center mb-4 fw-bold">Create a new account</h1>

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show mb-4"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          <RegisterForm onError={handleRegistrationError} />

          <div className="mt-4 text-center">
            <p className="text-muted small">
              By creating an account, you agree to our{" "}
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

export default RegisterPage;
