import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Clear general registration error when user changes any field
    if (registrationError) {
      setRegistrationError("");
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Validate full name
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Validate phone number
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^(\+\d{1,3})?\s?\d{9,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number is invalid";
    }

    // Validate address line 1
    if (!formData.addressLine1) {
      newErrors.addressLine1 = "Address line 1 is required";
    }

    // Validate city
    if (!formData.city) {
      newErrors.city = "City is required";
    }

    // Validate state
    if (!formData.state) {
      newErrors.state = "State/Province is required";
    }

    // Validate postal code
    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required";
    }

    // Validate country
    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setRegistrationError("");

    try {
      // Prepare data for API
      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        address: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      const response = await register(userData);

      if (response.success) {
        // Show success message and redirect to login page
        navigate("/login", {
          state: {
            successMessage:
              "Registration successful! Please check your email for login instructions.",
          },
        });
      } else {
        // Display error message
        setRegistrationError(
          response.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      setRegistrationError("An error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => {
    return (
      <>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
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
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="primary" onClick={nextStep}>
            Next
          </Button>
        </div>
      </>
    );
  };

  const renderStep2 = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="+84 123 456 789"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              autoComplete="address-line1"
              value={formData.addressLine1}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.addressLine1 ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="123 Main St"
            />
            {errors.addressLine1 && (
              <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address Line 2
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              autoComplete="address-line2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ho Chi Minh City"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              State / Province <span className="text-red-500">*</span>
            </label>
            <input
              id="state"
              name="state"
              type="text"
              autoComplete="address-level1"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.state ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ho Chi Minh"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              autoComplete="postal-code"
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.postalCode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="70000"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              autoComplete="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="Vietnam">Vietnam</option>
              <option value="Singapore">Singapore</option>
              <option value="Thailand">Thailand</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Philippines">Philippines</option>
              <option value="United States">United States</option>
              <option value="Other">Other</option>
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outlined" onClick={prevStep}>
            Back
          </Button>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
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
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create an Account
      </h2>

      {registrationError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{registrationError}</span>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex mb-8">
        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 === currentStep
                  ? "bg-primary-600 text-white"
                  : index + 1 < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1 < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 ${
                  index + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </form>

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">Already have an account?</span>
        <Link
          to="/login"
          className="ml-1 text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Sign in
        </Link>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <a
            href="/api/auth/google"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.2465 14.5164L12.0637 13.9576L8.44709 13.9633L8.26785 14.5221L9.78701 18.9974H9.69037L5.04602 7.53559H4.5V5.42254H9.53126V7.53559H8.39723L11.057 14.8461H11.1536L13.8077 7.53559H10.8491V5.42254H19.5V7.53559H18.1421L14.6841 16.8843V20.0001H19.5V22.1131H9V20.0001H13.7654V16.8843L12.2465 14.5164Z"
                fill="#EA4335"
              />
            </svg>
            <span className="ml-2">Google</span>
          </a>

          <a
            href="/api/auth/facebook"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg
              className="w-5 h-5 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="ml-2">Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
