import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/user.service";
import { toast } from "react-toastify";

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
    isDefault: false,
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
        isDefault: editingAddress.isDefault || false,
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
        isDefault: false,
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        toast.success(
          editingAddress
            ? "Address updated successfully!"
            : "New address added successfully!"
        );
        setShowAddForm(false);
        setEditingAddress(null);
        await fetchAddresses(); // Refresh the address list
      } else {
        throw new Error(
          response.message ||
            (editingAddress
              ? "Failed to update address"
              : "Failed to add address")
        );
      }
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle setting address as default
  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      const response = await userService.setDefaultAddress(addressId);

      if (response.success) {
        toast.success("Default address updated successfully!");
        await fetchAddresses(); // Refresh the address list
      } else {
        throw new Error(response.message || "Failed to update default address");
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle address deletion
  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await userService.deleteAddress(addressId);

      if (response.success) {
        toast.success("Address deleted successfully!");
        await fetchAddresses(); // Refresh the address list
      } else {
        throw new Error(response.message || "Failed to delete address");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-0">My Addresses</h2>
        <button
          className="btn btn-primary rounded-pill px-4 py-2"
          onClick={() => {
            setEditingAddress(null);
            setShowAddForm(!showAddForm);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          {showAddForm ? "Cancel" : "Add New Address"}
        </button>
      </div>

      {/* Form for adding/editing address */}
      {showAddForm && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <div className="card-header bg-light p-3 border-0">
            <h5 className="card-title mb-0">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h5>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label htmlFor="fullName" className="form-label">
                  Full Name*
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number*
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-phone"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Phone Number"
                  />
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="addressLine1" className="form-label">
                  Address Line 1*
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-house"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    placeholder="Street address, P.O. box, company name, etc."
                  />
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="addressLine2" className="form-label">
                  Address Line 2
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-building"></i>
                  </span>
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
              </div>
              <div className="col-md-6">
                <label htmlFor="city" className="form-label">
                  City*
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-pin-map"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label htmlFor="state" className="form-label">
                  State/Province*
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-geo"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="State/Province"
                  />
                </div>
              </div>
              <div className="col-md-2">
                <label htmlFor="postalCode" className="form-label">
                  Postal Code*
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  placeholder="Postal Code"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="country" className="form-label">
                  Country*
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-globe"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isDefault">
                    Set as default shipping address
                  </label>
                </div>
              </div>
              <div className="col-12 mt-4">
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : editingAddress ? (
                      "Update Address"
                    ) : (
                      "Save Address"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showAddForm && (
        <div className="text-center py-6">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your addresses...</p>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
      )}

      {!loading && !error && addresses.length === 0 && (
        <div className="text-center py-10 bg-light rounded-4 border border-dashed my-4">
          <div className="d-inline-block p-3 rounded-circle bg-light mb-3">
            <i
              className="bi bi-house-slash text-muted"
              style={{ fontSize: "2rem" }}
            ></i>
          </div>
          <h3 className="text-gray-500 mb-2">No Saved Addresses</h3>
          <p className="text-muted mb-4">
            You haven't added any delivery addresses yet.
          </p>
          <button
            className="btn btn-primary px-4 py-2 rounded-pill"
            onClick={() => {
              setEditingAddress(null);
              setShowAddForm(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Your First Address
          </button>
        </div>
      )}

      {!loading && !error && addresses.length > 0 && !showAddForm && (
        <div className="row g-4">
          {addresses.map((address) => (
            <div key={address._id} className="col-lg-6 col-md-12">
              <div
                className={`card h-100 transition-all hover-card ${
                  address.isDefault ? "border-primary" : "border-gray-200"
                }`}
              >
                <div className="card-body p-4">
                  {address.isDefault && (
                    <div className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1 rounded-bottom-start rounded-top-end">
                      <i className="bi bi-check-circle-fill me-1"></i> Default
                    </div>
                  )}
                  <h5 className="card-title fs-5 mb-1 text-primary">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    {address.fullName}
                  </h5>
                  <p className="card-text text-muted mb-1">
                    <i className="bi bi-telephone me-2"></i>
                    {address.phoneNumber}
                  </p>
                  <div className="mt-3 border-top pt-3">
                    <p className="mb-1">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="mb-1">{address.addressLine2}</p>
                    )}
                    <p className="mb-1">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="mb-0">{address.country}</p>
                  </div>
                </div>
                <div className="card-footer bg-transparent p-4 pt-0 border-0">
                  <div className="d-flex justify-content-between">
                    <div>
                      {!address.isDefault && (
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleSetDefault(address._id)}
                          disabled={loading}
                        >
                          <i className="bi bi-star me-1"></i> Set as Default
                        </button>
                      )}
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => {
                          setEditingAddress(address);
                          setShowAddForm(true);
                        }}
                        disabled={loading}
                      >
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(address._id)}
                        disabled={loading}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
