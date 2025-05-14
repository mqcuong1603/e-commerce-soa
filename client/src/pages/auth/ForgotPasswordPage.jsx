import React, { useState } from "react";
import { Link } from "react-router-dom";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import Card from "../../components/ui/Card";

/**
 * ForgotPasswordPage component
 * Displays form for users to request password reset
 */
const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  // Handle successful form submission
  const handleSuccess = (submittedEmail) => {
    setEmail(submittedEmail);
    setSubmitted(true);
    setError("");
  };

  // Handle form submission error
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setSubmitted(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Reset Your Password
        </h1>

        {/* Display error message if any */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Show success message after submission */}
        {submitted ? (
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
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent password reset instructions to:
              <br />
              <span className="font-medium text-gray-800">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you don't receive an email within a few minutes, please check
              your spam folder or try again.
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Try Again
              </button>
              <Link
                to="/login"
                className="w-full text-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Login
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <ForgotPasswordForm
              onSuccess={handleSuccess}
              onError={handleError}
            />
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}

        {/* Help text at the bottom */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help?{" "}
            <Link
              to="/contact"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
