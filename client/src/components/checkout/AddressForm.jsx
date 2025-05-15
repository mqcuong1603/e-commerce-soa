import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Form for collecting shipping address information
 */
const AddressForm = ({ onSubmit, initialData, savedAddresses }) => {
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [selectedSavedAddress, setSelectedSavedAddress] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(
    !savedAddresses || savedAddresses.length === 0
  );

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prevData) => ({
        ...prevData,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Populate form with selected address
  useEffect(() => {
    if (selectedSavedAddress && savedAddresses) {
      const selectedAddress = savedAddresses.find(
        (addr) => addr._id === selectedSavedAddress
      );
      if (selectedAddress) {
        setFormData({
          fullName: selectedAddress.fullName,
          phoneNumber: selectedAddress.phoneNumber,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
        });
      }
    }
  }, [selectedSavedAddress, savedAddresses]);

  // Populate form with user data if available
  useEffect(() => {
    if (isAuthenticated && user && !initialData && !selectedSavedAddress) {
      setFormData((prevData) => ({
        ...prevData,
        fullName: user.fullName || prevData.fullName,
      }));
    }
  }, [isAuthenticated, user, initialData, selectedSavedAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSavedAddressChange = (e) => {
    const value = e.target.value;
    setSelectedSavedAddress(value);

    if (value === "new") {
      setUseNewAddress(true);
      // Reset form data to empty (or defaults)
      setFormData({
        fullName: user?.fullName || "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Vietnam",
      });
    } else {
      setUseNewAddress(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Required fields
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.addressLine1)
      newErrors.addressLine1 = "Address line 1 is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State/Province is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
    if (!formData.country) newErrors.country = "Country is required";

    // Phone number format validation
    const phoneRegex = /^(\+\d{1,3})?\s?\d{9,15}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Find how form data is submitted - likely through onSubmit or similar prop
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Create address data object
    const addressData = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || "",
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
    };

    // Safely handle the saveAddress checkbox
    if (isAuthenticated && e.target.elements.saveAddress) {
      addressData.saveAddress = e.target.elements.saveAddress.checked;
    } else {
      addressData.saveAddress = false; // Default for guest users
    }

    // Submit the form data
    onSubmit(addressData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Saved Addresses (for authenticated users) */}
        {isAuthenticated && savedAddresses && savedAddresses.length > 0 && (
          <div className="mb-4">
            <label className="form-label fw-medium">
              Select a shipping address
            </label>
            <div className="d-flex flex-column gap-3">
              {savedAddresses.map((address) => (
                <div key={address._id} className="form-check card border">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start">
                      <input
                        type="radio"
                        className="form-check-input mt-2 me-2"
                        name="savedAddress"
                        id={`address-${address._id}`}
                        value={address._id}
                        checked={selectedSavedAddress === address._id}
                        onChange={handleSavedAddressChange}
                      />
                      <label
                        className="form-check-label w-100"
                        htmlFor={`address-${address._id}`}
                      >
                        <div className="fw-medium">{address.fullName}</div>
                        <div className="text-muted small">
                          {address.addressLine1},
                          {address.addressLine2
                            ? `${address.addressLine2}, `
                            : " "}
                          {address.city}, {address.state} {address.postalCode},{" "}
                          {address.country}
                        </div>
                        <div className="text-muted small">
                          {address.phoneNumber}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <div className="form-check card border">
                <div className="card-body p-3">
                  <div className="d-flex align-items-start">
                    <input
                      type="radio"
                      className="form-check-input mt-2 me-2"
                      name="savedAddress"
                      id="address-new"
                      value="new"
                      checked={useNewAddress}
                      onChange={handleSavedAddressChange}
                    />
                    <label
                      className="form-check-label w-100"
                      htmlFor="address-new"
                    >
                      <div className="fw-medium">Use a new address</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Address Form */}
        {(!savedAddresses || savedAddresses.length === 0 || useNewAddress) && (
          <div className="mt-4">
            <div className="row g-3">
              {/* Full Name */}
              <div className="col-12">
                <label htmlFor="fullName" className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName" // Make sure this is exactly "fullName"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              {/* Phone Number */}
              <div className="col-12">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number <span className="text-danger">*</span>
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
                  placeholder="+84 123 456 789"
                />
                {errors.phoneNumber && (
                  <div className="invalid-feedback">{errors.phoneNumber}</div>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="col-12">
                <label htmlFor="addressLine1" className="form-label">
                  Address Line 1 <span className="text-danger">*</span>
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
                  placeholder="123 Main St"
                />
                {errors.addressLine1 && (
                  <div className="invalid-feedback">{errors.addressLine1}</div>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="col-12">
                <label htmlFor="addressLine2" className="form-label">
                  Address Line 2
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              {/* City */}
              <div className="col-md-6">
                <label htmlFor="city" className="form-label">
                  City <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.city ? "is-invalid" : ""}`}
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ho Chi Minh City"
                />
                {errors.city && (
                  <div className="invalid-feedback">{errors.city}</div>
                )}
              </div>

              {/* State/Province */}
              <div className="col-md-6">
                <label htmlFor="state" className="form-label">
                  State/Province <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.state ? "is-invalid" : ""}`}
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Ho Chi Minh"
                />
                {errors.state && (
                  <div className="invalid-feedback">{errors.state}</div>
                )}
              </div>

              {/* Postal Code */}
              <div className="col-md-6">
                <label htmlFor="postalCode" className="form-label">
                  Postal Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.postalCode ? "is-invalid" : ""
                  }`}
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="70000"
                />
                {errors.postalCode && (
                  <div className="invalid-feedback">{errors.postalCode}</div>
                )}
              </div>

              {/* Country */}
              <div className="col-md-6">
                <label htmlFor="country" className="form-label">
                  Country <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${
                    errors.country ? "is-invalid" : ""
                  }`}
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
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
                  <div className="invalid-feedback">{errors.country}</div>
                )}
              </div>

              {/* Save Address Checkbox (Only for authenticated users) */}
              {isAuthenticated && (
                <div className="col-12">
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="saveAddress"
                      name="saveAddress"
                    />
                    <label className="form-check-label" htmlFor="saveAddress">
                      Save this address for future orders
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button type="submit" className="btn btn-danger w-100">
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

AddressForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  savedAddresses: PropTypes.array,
};

export default AddressForm;
