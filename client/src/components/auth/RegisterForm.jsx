import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (registerError) {
      setRegisterError("");
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.addressLine1) {
      newErrors.addressLine1 = "Address is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setRegisterError("");

    try {
      const response = await register(formData);

      if (response.success) {
        navigate("/login", {
          state: {
            successMessage:
              "Registration successful! Please check your email to verify your account.",
          },
        });
      } else {
        setRegisterError(
          response.error || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      setRegisterError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4 fw-bold">
          Create an Account
        </h2>

        {registerError && (
          <div className="alert alert-danger py-2" role="alert">
            {registerError}
          </div>
        )}

        <div className="mb-4">
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: step === 1 ? "50%" : "100%" }}
              aria-valuenow={step === 1 ? 50 : 100}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-1">
            <span
              className={`small ${step >= 1 ? "text-success fw-bold" : ""}`}
            >
              Account Details
            </span>
            <span
              className={`small ${step >= 2 ? "text-success fw-bold" : ""}`}
            >
              Personal Information
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.fullName ? "is-invalid" : ""
                  }`}
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
                <div className="form-text">
                  Password must be at least 6 characters
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className={`form-control ${
                    errors.phoneNumber ? "is-invalid" : ""
                  }`}
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                {errors.phoneNumber && (
                  <div className="invalid-feedback">{errors.phoneNumber}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="addressLine1" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.addressLine1 ? "is-invalid" : ""
                  }`}
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                />
                {errors.addressLine1 && (
                  <div className="invalid-feedback">{errors.addressLine1}</div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.city ? "is-invalid" : ""
                    }`}
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city}</div>
                  )}
                </div>
                <div className="col">
                  <label htmlFor="state" className="form-label">
                    State/Province
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col">
                  <label htmlFor="postalCode" className="form-label">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select
                    className="form-select"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="Vietnam">Vietnam</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1"
                  onClick={handlePrev}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </>
          )}

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-decoration-none text-danger">
              Sign in
            </Link>
          </div>

          {step === 1 && (
            <>
              <div className="position-relative my-4">
                <hr />
                <div className="position-absolute top-50 start-50 translate-middle px-3 bg-white">
                  <span className="text-muted">Or register with</span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <a
                    href="/api/auth/google"
                    className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                  >
                    <i className="bi bi-google me-2"></i>
                    Google
                  </a>
                </div>
                <div className="col-6">
                  <a
                    href="/api/auth/facebook"
                    className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                  >
                    <i className="bi bi-facebook me-2"></i>
                    Facebook
                  </a>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
