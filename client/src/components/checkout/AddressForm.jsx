import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData, selectedSavedAddress);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Saved Addresses (for authenticated users) */}
        {isAuthenticated && savedAddresses && savedAddresses.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a shipping address
            </label>
            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <label
                  key={address._id}
                  className={`block border rounded-md p-3 cursor-pointer hover:border-primary-500 ${
                    selectedSavedAddress === address._id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="savedAddress"
                      value={address._id}
                      checked={selectedSavedAddress === address._id}
                      onChange={handleSavedAddressChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {address.addressLine1},
                        {address.addressLine2
                          ? `${address.addressLine2}, `
                          : " "}
                        {address.city}, {address.state} {address.postalCode},{" "}
                        {address.country}
                      </p>
                      <p className="text-sm text-gray-500">
                        {address.phoneNumber}
                      </p>
                    </div>
                  </div>
                </label>
              ))}

              <label
                className={`block border rounded-md p-3 cursor-pointer hover:border-primary-500 ${
                  useNewAddress
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="savedAddress"
                    value="new"
                    checked={useNewAddress}
                    onChange={handleSavedAddressChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="font-medium">Use a new address</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* New Address Form */}
        {(!savedAddresses || savedAddresses.length === 0 || useNewAddress) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="md:col-span-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+84 123 456 789"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label
                  htmlFor="addressLine1"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.addressLine1 ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="123 Main St"
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="md:col-span-2">
                <label
                  htmlFor="addressLine2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ho Chi Minh City"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {/* State/Province */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ho Chi Minh"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                    errors.postalCode ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="70000"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Country */}
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
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
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

              {/* Save Address Checkbox (Only for authenticated users) */}
              {isAuthenticated && (
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="saveAddress"
                      name="saveAddress"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="saveAddress"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Save this address for future orders
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button type="submit" variant="primary" fullWidth>
            Continue to Payment
          </Button>
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
