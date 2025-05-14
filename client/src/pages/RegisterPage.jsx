import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../contexts/AuthContext";

/**
 * Register Page component
 * Displays registration form and handles redirect after successful registration
 */
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

  // Handle successful registration
  const handleRegistrationSuccess = () => {
    // Redirect to login page with success message
    navigate("/login", {
      state: {
        successMessage:
          "Registration successful! Please check your email for login instructions.",
      },
      replace: true,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Create a new account
        </h1>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <RegisterForm
          onError={handleRegistrationError}
          onSuccess={handleRegistrationSuccess}
        />

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By creating an account, you agree to our{" "}
            <a
              href="/terms"
              className="text-primary-600 hover:text-primary-500"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-primary-600 hover:text-primary-500"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
