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
    address: {
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Vietnam",
    },
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear errors
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.address.phoneNumber) {
      newErrors["address.phoneNumber"] = "Phone number is required";
    }

    if (!formData.address.addressLine1) {
      newErrors["address.addressLine1"] = "Address is required";
    }

    if (!formData.address.city) {
      newErrors["address.city"] = "City is required";
    }

    if (!formData.address.state) {
      newErrors["address.state"] = "State/Province is required";
    }

    if (!formData.address.postalCode) {
      newErrors["address.postalCode"] = "Postal code is required";
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
              "Registration successful! Please check your email to verify your account and set your password.",
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
    <div className="card shadow border-0">
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4 fw-bold">
          Create an Account
        </h2>

        {registerError && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {registerError}
          </div>
        )}

        <div className="mb-4">
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-danger"
              role="progressbar"
              style={{ width: step === 1 ? "50%" : "100%" }}
              aria-valuenow={step === 1 ? 50 : 100}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-1">
            <span className={`small ${step >= 1 ? "text-danger fw-bold" : ""}`}>
              <i className="bi bi-person-circle me-1"></i>
              Account Info
            </span>
            <span className={`small ${step >= 2 ? "text-danger fw-bold" : ""}`}>
              <i className="bi bi-geo-alt me-1"></i>
              Shipping Address
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
                <div className="input-group mb-1">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.fullName ? "is-invalid" : ""
                    }`}
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-group mb-1">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
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
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  You'll receive a verification email to set your password
                </div>
              </div>

              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-danger btn-lg"
                  onClick={handleNext}
                >
                  <i className="bi bi-arrow-right-circle me-2"></i>
                  Continue to Address Details
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label htmlFor="address.phoneNumber" className="form-label">
                  Phone Number
                </label>
                <div className="input-group mb-1">
                  <span className="input-group-text">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors["address.phoneNumber"] ? "is-invalid" : ""
                    }`}
                    id="address.phoneNumber"
                    name="address.phoneNumber"
                    placeholder="(+84) 123 456 789"
                    value={formData.address.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  {errors["address.phoneNumber"] && (
                    <div className="invalid-feedback">
                      {errors["address.phoneNumber"]}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="address.addressLine1" className="form-label">
                  Street Address
                </label>
                <div className="input-group mb-1">
                  <span className="input-group-text">
                    <i className="bi bi-house"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${
                      errors["address.addressLine1"] ? "is-invalid" : ""
                    }`}
                    id="address.addressLine1"
                    name="address.addressLine1"
                    placeholder="123 Main Street"
                    value={formData.address.addressLine1}
                    onChange={handleChange}
                    required
                  />
                  {errors["address.addressLine1"] && (
                    <div className="invalid-feedback">
                      {errors["address.addressLine1"]}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="address.addressLine2" className="form-label">
                  Apartment, Suite, etc. (optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address.addressLine2"
                  name="address.addressLine2"
                  placeholder="Apt #123, Floor 4, etc."
                  value={formData.address.addressLine2}
                  onChange={handleChange}
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="address.city" className="form-label">
                    City
                  </label>
                  <div className="input-group mb-1">
                    <span className="input-group-text">
                      <i className="bi bi-building"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors["address.city"] ? "is-invalid" : ""
                      }`}
                      id="address.city"
                      name="address.city"
                      placeholder="Ho Chi Minh City"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                    />
                    {errors["address.city"] && (
                      <div className="invalid-feedback">
                        {errors["address.city"]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="address.state" className="form-label">
                    State/Province
                  </label>
                  <div className="input-group mb-1">
                    <span className="input-group-text">
                      <i className="bi bi-map"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors["address.state"] ? "is-invalid" : ""
                      }`}
                      id="address.state"
                      name="address.state"
                      placeholder="Ho Chi Minh"
                      value={formData.address.state}
                      onChange={handleChange}
                      required
                    />
                    {errors["address.state"] && (
                      <div className="invalid-feedback">
                        {errors["address.state"]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label htmlFor="address.postalCode" className="form-label">
                    Postal Code
                  </label>
                  <div className="input-group mb-1">
                    <span className="input-group-text">
                      <i className="bi bi-mailbox"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${
                        errors["address.postalCode"] ? "is-invalid" : ""
                      }`}
                      id="address.postalCode"
                      name="address.postalCode"
                      placeholder="70000"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      required
                    />
                    {errors["address.postalCode"] && (
                      <div className="invalid-feedback">
                        {errors["address.postalCode"]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="address.country" className="form-label">
                    Country
                  </label>
                  <select
                    className="form-select"
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
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
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-danger flex-grow-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Register
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link
              to="/login"
              className="text-decoration-none text-danger fw-bold"
            >
              Sign in
            </Link>
          </div>

          {step === 1 && (
            <>
              <div className="position-relative my-4">
                <hr />
                <div className="position-absolute top-50 start-50 translate-middle px-3 bg-white">
                  <span className="text-muted small">Or register with</span>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <a
                    href={`${
                      process.env.REACT_APP_API_URL || "http://localhost:3000"
                    }/api/auth/google`}
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
