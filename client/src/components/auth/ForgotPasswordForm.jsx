import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import Button from "../ui/Button";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: "",
  });

  const handleChange = (e) => {
    setEmail(e.target.value);

    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(email);

      // Most password reset APIs don't confirm if the email exists for security reasons,
      // so we'll show a success message regardless of the actual result
      setFormStatus({
        submitted: true,
        success: true,
        message:
          response.message ||
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      setFormStatus({
        submitted: true,
        success: false,
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setFormStatus({
      submitted: false,
      success: false,
      message: "",
    });
  };

  // If form was successfully submitted, show success message
  if (formStatus.submitted && formStatus.success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            Check Your Email
          </h2>
          <p className="mt-2 text-gray-600">{formStatus.message}</p>
          <p className="mt-4 text-sm text-gray-500">
            If you don't receive an email within a few minutes, check your spam
            folder or try again.
          </p>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <Button variant="outlined" fullWidth onClick={handleTryAgain}>
            Try again with a different email
          </Button>

          <Link
            to="/login"
            className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // Show error message if submission failed
  if (formStatus.submitted && !formStatus.success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            Something Went Wrong
          </h2>
          <p className="mt-2 text-gray-600">{formStatus.message}</p>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <Button variant="primary" fullWidth onClick={handleTryAgain}>
            Try again
          </Button>

          <Link
            to="/login"
            className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // Default form view
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Forgot Password
      </h2>

      <div className="mb-6">
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth={true}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
