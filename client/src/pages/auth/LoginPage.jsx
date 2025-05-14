import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Login Page component
 * Displays login form and handles redirect after successful login
 */
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

      // Clear the success message from location state to prevent showing it on page refresh
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Sign in to your account
        </h1>

        {/* Success message (e.g., from registration) */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 relative">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
