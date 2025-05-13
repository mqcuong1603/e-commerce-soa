import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/user.service";
import Button from "../ui/Button";

/**
 * Component to display and manage user addresses
 */
const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
  });
  const navigate = useNavigate();

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // Reset form when editingAddress changes
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        fullName: editingAddress.fullName || "",
        phoneNumber: editingAddress.phoneNumber || "",
        addressLine1: editingAddress.addressLine1 || "",
        addressLine2: editingAddress.addressLine2 || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        postalCode: editingAddress.postalCode || "",
        country: editingAddress.country || "Vietnam",
      });
    } else {
      setFormData({
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Vietnam",
      });
    }
  }, [editingAddress]);

  // Fetch addresses from API
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserAddresses();

      if (response.success) {
        setAddresses(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch addresses");
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Failed to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (add/edit address)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      let response;

      if (editingAddress) {
        // Edit existing address
        response = await userService.updateAddress(
          editingAddress._id,
          formData
        );
      } else {
        // Add new address
        response = await userService.addAddress(formData);
      }

      if (response.success) {
        // Reset form and refresh address list
        setShowAddForm(false);
        setEditingAddress(null);
        fetchAddresses();
      } else {
        throw new Error(response.message || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Set address as default
  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      const response = await userService.setDefaultAddress(addressId);

      if (response.success) {
        fetchAddresses();
      } else {
        throw new Error(response.message || "Failed to set default address");
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDelete = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setLoading(true);
        const response = await userService.deleteAddress(addressId);

        if (response.success) {
          fetchAddresses();
        } else {
          throw new Error(response.message || "Failed to delete address");
        }
      } catch (err) {
        console.error("Error deleting address:", err);
        setError("Failed to delete address. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Start editing an address
  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  // Render loading state
  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Addresses</h2>
        {!showAddForm && (
          <Button
            variant="primary"
            size="small"
            onClick={() => setShowAddForm(true)}
          >
            Add New Address
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* State */}
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outlined" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingAddress
                  ? "Update Address"
                  : "Add Address"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="border rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium">{address.fullName}</h3>
                    {address.isDefault && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                  <p className="text-sm text-gray-800 mt-2">
                    {address.addressLine1}
                    {address.addressLine2 && (
                      <span>, {address.addressLine2}</span>
                    )}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
                <div className="flex flex-col justify-start space-y-2">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSetDefault(address._id)}
                    >
                      Set Default
                    </Button>
                  )}
                  {!address.isDefault && (
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(address._id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            You don't have any saved addresses yet.
          </p>
          {!showAddForm && (
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              Add Your First Address
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressList;
