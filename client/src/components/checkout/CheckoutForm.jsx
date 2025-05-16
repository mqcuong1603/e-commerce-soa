import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import orderService from "../../services/order.service";
import userService from "../../services/user.service";

// Add isGuestCheckout to props
const CheckoutForm = ({
  discountCode,
  usingLoyaltyPoints,
  onOrderSuccess,
  isGuestCheckout = false,
}) => {
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State from previous page (if any)
  // const { discountCode, usingLoyaltyPoints } = location.state || {};

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  // const [showAddressForm, setShowAddressForm] = useState(!isAuthenticated);
  const [showAddressForm, setShowAddressForm] = useState(
    !isAuthenticated || isGuestCheckout
  );
  const [addressFormData, setAddressFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
  });

  // Order summary states
  const [discountData, setDiscountData] = useState({
    code: discountCode || "",
    amount: 0,
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    available: 0,
    used: 0,
    value: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Make sure this state variable exists
  const [guestEmail, setGuestEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // New state for shipping address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
  });

  // Fetch user addresses if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAddresses();
      fetchLoyaltyPoints();

      // Pre-fill address form with user data
      setAddressFormData((prevData) => ({
        ...prevData,
        fullName: user?.fullName || prevData.fullName,
        email: user?.email || prevData.email,
      }));
    }
  }, [isAuthenticated, user]);

  // Verify discount code if provided
  useEffect(() => {
    if (discountCode && cart.total > 0) {
      verifyDiscountCode(discountCode);
    }
  }, [discountCode, cart.total]);

  // Calculate loyalty points usage
  useEffect(() => {
    if (usingLoyaltyPoints && loyaltyPoints.available > 0) {
      const maxPointsValue = Math.min(
        loyaltyPoints.available * 1000,
        cart.subtotal - (discountData.amount || 0)
      );
      const pointsToUse = Math.floor(maxPointsValue / 1000);

      setLoyaltyPoints((prev) => ({
        ...prev,
        used: pointsToUse,
        value: pointsToUse * 1000,
      }));
    }
  }, [
    usingLoyaltyPoints,
    loyaltyPoints.available,
    cart.subtotal,
    discountData.amount,
  ]);

  // Fetch user addresses
  const fetchUserAddresses = async () => {
    try {
      const response = await userService.getUserAddresses();

      if (response.success) {
        setAddresses(response.data || []);

        // Select default address if available
        const defaultAddress = response.data.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (response.data.length > 0) {
          setSelectedAddressId(response.data[0]._id);
        } else {
          // No addresses found, show address form
          setShowAddressForm(true);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // If error fetching addresses, show address form
      setShowAddressForm(true);
    }
  };

  // Fetch loyalty points
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await userService.getLoyaltyPoints();

      if (response.success) {
        setLoyaltyPoints((prev) => ({
          ...prev,
          available: response.data.loyaltyPoints || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching loyalty points:", error);
    }
  };

  // Verify discount code
  const verifyDiscountCode = async (code) => {
    if (!code || !cart.total) return;

    try {
      const response = await orderService.verifyDiscount(code);

      if (response.success) {
        setDiscountData({
          code: code,
          amount: response.data.discountAmount || 0,
        });
      } else {
        // Invalid discount code, clear it
        setDiscountData({
          code: "",
          amount: 0,
        });
      }
    } catch (error) {
      console.error("Error verifying discount code:", error);
      setDiscountData({
        code: "",
        amount: 0,
      });
    }
  };

  // Handle address form changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle guest email change
  const handleGuestEmailChange = (e) => {
    setGuestEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  // Handle next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step
      if (currentStep === 1) {
        // First check email for guest checkout
        if (isGuestCheckout && (!guestEmail || !validateEmail(guestEmail))) {
          setEmailError(
            guestEmail
              ? "Please enter a valid email address"
              : "Email is required for guest checkout"
          );
          return;
        }

        // Then validate address form
        if (!selectedAddressId) {
          if (!validateAddressForm()) {
            return;
          }
        }
      }

      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Validate email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Update the validateAddressForm function

  const validateAddressForm = () => {
    // Check both shippingAddress and addressFormData for safety
    const addressToCheck = selectedAddressId
      ? shippingAddress
      : addressFormData;
    console.log("Validating address:", addressToCheck);

    const requiredFields = [
      "fullName",
      "phoneNumber",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    for (const field of requiredFields) {
      if (!addressToCheck[field]) {
        setError(
          `Please fill in all required address fields (missing ${field})`
        );
        return false;
      }
    }

    // If validation passes, update shippingAddress to ensure it has the latest data
    if (!selectedAddressId) {
      setShippingAddress({ ...addressFormData });
    }

    setError("");
    return true;
  };

  // Add this helper function to validate with provided data
  const validateAddressWithData = (addressData) => {
    const requiredFields = [
      "fullName",
      "phoneNumber",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    for (const field of requiredFields) {
      if (!addressData[field]) {
        setError(
          `Please fill in all required address fields (missing ${field})`
        );
        return false;
      }
    }

    setError("");
    return true;
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Handle order notes change
  const handleNotesChange = (e) => {
    setOrderNotes(e.target.value);
  };

  // Calculate totals
  const subtotal = cart.subtotal || 0;
  const shipping = 35000; // Fixed shipping fee in VND
  const discount = discountData.amount || 0;
  const pointsDiscount = loyaltyPoints.value || 0;
  const total = subtotal + shipping - discount - pointsDiscount;

  // Format currency
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Place order
  const placeOrder = async () => {
    // Validate final step
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    // For guest checkout, validate email
    if (isGuestCheckout) {
      if (!guestEmail) {
        setEmailError("Email is required for guest checkout");
        return;
      }

      if (!validateEmail(guestEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }
    }

    // Prepare shipping address
    let shippingAddress = null;
    if (selectedAddressId) {
      // Use selected address
      const address = addresses.find((addr) => addr._id === selectedAddressId);
      if (address) {
        shippingAddress = {
          fullName: address.fullName,
          phoneNumber: address.phoneNumber,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        };
      }
    } else {
      // Use address form data
      shippingAddress = { ...addressFormData };
    }

    if (!shippingAddress) {
      setError("Shipping address is required");
      return;
    }

    // Prepare order data
    const orderData = {
      shippingAddress: {
        fullName: shippingAddress.fullName, // Must match server's expected property name
        phoneNumber: shippingAddress.phoneNumber,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentMethod,
      discountCode: discountData.code || null,
      loyaltyPointsUsed: loyaltyPoints.used || 0,
      notes: orderNotes,
      email: isGuestCheckout ? guestEmail : undefined,
    };

    // Debug output
    console.log("Order data being sent:", orderData);

    setLoading(true);
    setError("");

    try {
      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Order created successfully
        setOrderSuccess(true);
        setOrderData(response.data.order);

        // Clear cart
        await clearCart();

        // If this was a guest checkout, redirect to success page with account info
        if (isGuestCheckout) {
          // Pass both order data and guest email for proper notification
          navigate("/order-success", {
            state: {
              order: response.data.order,
              isGuestCheckout: true,
              guestEmail: guestEmail,
            },
            replace: true,
          });
        } else {
          // For logged in users, go to order detail page
          navigate(`/orders/${response.data.order._id}`, {
            state: { isNewOrder: true },
            replace: true,
          });
        }
      } else {
        setError(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("An error occurred while processing your order");
    } finally {
      setLoading(false);
    }
  };

  // Render success page
  if (orderSuccess && orderData) {
    return (
      <div className="card">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div
              className="bg-success text-white p-3 rounded-circle mx-auto mb-3"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-check-lg fs-1"></i>
            </div>
            <h3>Order Placed Successfully!</h3>
            <p className="text-muted">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <p className="text-muted mb-1">Order Number:</p>
                  <p className="fw-bold">{orderData.orderNumber}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Order Date:</p>
                  <p className="fw-bold">
                    {new Date(orderData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Payment Method:</p>
                  <p className="fw-bold">
                    {paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : paymentMethod === "bank"
                      ? "Bank Transfer"
                      : paymentMethod === "credit"
                      ? "Credit Card"
                      : "Unknown"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Total Amount:</p>
                  <p className="fw-bold">₫{formatPrice(orderData.total)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="d-grid gap-3">
            <button
              className="btn btn-danger"
              onClick={() => navigate(`/orders/${orderData._id}`)}
            >
              View Order Details
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        {/* Progress steps */}
        <div className="mb-4">
          <div className="position-relative mb-4">
            <div className="progress" style={{ height: "2px" }}>
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                }}
                aria-valuenow={((currentStep - 1) / (totalSteps - 1)) * 100}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            <div
              className="position-absolute top-0 start-0 translate-middle d-flex align-items-center justify-content-center rounded-circle bg-danger text-white"
              style={{ width: "30px", height: "30px" }}
            >
              {currentStep > 1 ? <i className="bi bi-check"></i> : 1}
            </div>

            <div
              style={{ width: "30px", height: "30px" }}
              className={`position-absolute top-0 start-50 translate-middle d-flex align-items-center justify-content-center rounded-circle ${
                currentStep > 1 ? "bg-danger text-white" : "bg-light text-dark"
              }`}
            >
              {currentStep > 2 ? <i className="bi bi-check"></i> : 2}
            </div>

            <div
              style={{ width: "30px", height: "30px" }}
              className={`position-absolute top-0 end-0 translate-middle d-flex align-items-center justify-content-center rounded-circle ${
                currentStep > 2 ? "bg-danger text-white" : "bg-light text-dark"
              }`}
            >
              3
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <div
              className={`text-center ${
                currentStep === 1 ? "fw-bold text-danger" : ""
              }`}
            >
              Shipping
            </div>
            <div
              className={`text-center ${
                currentStep === 2 ? "fw-bold text-danger" : ""
              }`}
            >
              Payment
            </div>
            <div
              className={`text-center ${
                currentStep === 3 ? "fw-bold text-danger" : ""
              }`}
            >
              Review
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Main content based on current step */}
        <div className="mb-4">
          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <div>
              <h4 className="mb-3">Shipping Address</h4>

              {/* Guest email input - Put this BEFORE address selection */}
              {isGuestCheckout && (
                <div className="mb-4">
                  <h5 className="mb-3">Contact Information</h5>
                  <div className="form-floating">
                    <input
                      type="email"
                      className={`form-control ${
                        emailError ? "is-invalid" : ""
                      }`}
                      id="guestEmail"
                      placeholder="name@example.com"
                      value={guestEmail}
                      onChange={handleGuestEmailChange}
                      required
                    />
                    <label htmlFor="guestEmail">
                      Email address for order confirmation
                    </label>
                    {emailError && (
                      <div className="invalid-feedback">{emailError}</div>
                    )}
                  </div>
                  <div className="mt-3 small text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    Your order confirmation and receipt will be sent to this
                    email address
                  </div>
                  <div className="mt-3">
                    <div className="form-text">
                      Already have an account?{" "}
                      <a href="/login" className="text-danger">
                        Login here
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Address selection for logged in users */}
              {isAuthenticated && addresses.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Saved Addresses</h5>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="btn btn-link text-danger p-0"
                    >
                      {showAddressForm
                        ? "Use Saved Address"
                        : "Add New Address"}
                    </button>
                  </div>

                  {!showAddressForm && (
                    <div className="d-flex flex-column gap-3">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          className={`card border ${
                            selectedAddressId === address._id
                              ? "border-danger"
                              : ""
                          }`}
                          onClick={() => setSelectedAddressId(address._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between">
                              <div className="fw-medium">
                                {address.fullName}
                              </div>
                              {address.isDefault && (
                                <span className="badge bg-success">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-muted small">
                              {address.phoneNumber}
                            </div>
                            <div className="mt-2 small">
                              {address.addressLine1}
                              {address.addressLine2 && (
                                <span>, {address.addressLine2}</span>
                              )}
                              <br />
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                              <br />
                              {address.country}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Address form (for new addresses or guest checkout) */}
              {(showAddressForm || !isAuthenticated) && (
                <AddressForm
                  onSubmit={(addressData) => {
                    console.log(
                      "Received address data in CheckoutForm:",
                      addressData
                    );

                    // First update the state with the new data
                    setShippingAddress(addressData);
                    setAddressFormData(addressData);

                    // Then validate with the updated data
                    setTimeout(() => {
                      // Use the passed data directly instead of relying on state
                      if (validateAddressWithData(addressData)) {
                        setCurrentStep(currentStep + 1);
                      }
                    }, 0);
                  }}
                  initialData={addressFormData}
                  savedAddresses={addresses}
                />
              )}
            </div>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div>
              <h4 className="mb-3">Payment Method</h4>

              <PaymentForm
                selectedMethod={paymentMethod}
                onSelectMethod={handlePaymentMethodChange}
              />

              {/* Order notes */}
              <div className="mt-4">
                <label htmlFor="orderNotes" className="form-label">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="orderNotes"
                  name="orderNotes"
                  rows="3"
                  value={orderNotes}
                  onChange={handleNotesChange}
                  className="form-control"
                  placeholder="Special instructions for delivery"
                ></textarea>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <div>
              <h4 className="mb-3">Review Your Order</h4>

              {/* Order items */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Order Items ({cart.itemCount || 0})</h5>
                </div>

                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    {cart.items &&
                      cart.items.map((item) => {
                        const product = item.productVariantId.productId;
                        const variant = item.productVariantId;

                        // Get image from variant first, then fall back to product
                        const itemImage =
                          variant.images && variant.images.length > 0
                            ? variant.images[0]
                            : product &&
                              product.images &&
                              product.images.length > 0
                            ? product.images.find((img) => img.isMain) ||
                              product.images[0]
                            : null;

                        return (
                          <li
                            key={item.productVariantId._id}
                            className="list-group-item py-3"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="border rounded me-3"
                                style={{ width: "60px", height: "60px" }}
                              >
                                {itemImage ? (
                                  <img
                                    src={itemImage.imageUrl}
                                    alt={product?.name || "Product"}
                                    className="w-100 h-100 object-fit-contain"
                                  />
                                ) : (
                                  <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                    <span className="text-muted small">
                                      No image
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-medium">
                                  {product?.name || "Product"}
                                </div>
                                <div className="small text-muted">
                                  {variant?.name || "Variant"}
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="fw-medium">
                                  ₫{formatPrice(item.price)}
                                </div>
                                <div className="small text-muted">
                                  x{item.quantity}
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>

              {/* Shipping address */}
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Shipping Address</h5>
                  {currentStep === totalSteps && (
                    <button
                      type="button"
                      onClick={() => {
                        // Make sure this sets the correct step (step 1 for shipping)
                        setCurrentStep(1);
                        // Make sure to preserve the address data when navigating back
                        setAddressFormData(shippingAddress);
                        setShowAddressForm(true); // Show the address form when returning
                      }}
                      className="btn btn-link text-danger p-0"
                    >
                      Change
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {selectedAddressId ? (
                    // Show selected address
                    (() => {
                      const address = addresses.find(
                        (addr) => addr._id === selectedAddressId
                      );
                      if (!address) return null;

                      return (
                        <div>
                          <div className="fw-medium">{address.fullName}</div>
                          <div className="text-muted small">
                            {address.phoneNumber}
                          </div>
                          <div className="mt-2">
                            {address.addressLine1}
                            {address.addressLine2 && (
                              <span>, {address.addressLine2}</span>
                            )}
                            <br />
                            {address.city}, {address.state} {address.postalCode}
                            <br />
                            {address.country}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // Show address form data
                    <div>
                      <div className="fw-medium">
                        {shippingAddress.fullName}{" "}
                        {/* Use shippingAddress instead of addressFormData */}
                      </div>
                      <div className="text-muted small">
                        {shippingAddress.phoneNumber}
                      </div>
                      <div className="mt-2">
                        {shippingAddress.addressLine1}
                        {shippingAddress.addressLine2 && (
                          <span>, {shippingAddress.addressLine2}</span>
                        )}
                        <br />
                        {shippingAddress.city}, {shippingAddress.state}{" "}
                        {shippingAddress.postalCode}
                        <br />
                        {shippingAddress.country}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payment Method</h5>
                  {currentStep === totalSteps && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="btn btn-link text-danger p-0"
                    >
                      Change
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="fw-medium">
                    {paymentMethod === "cod" && "Cash on Delivery"}
                    {paymentMethod === "bank" && "Bank Transfer"}
                    {paymentMethod === "credit" && "Credit Card"}
                  </div>
                  {paymentMethod === "bank" && (
                    <div className="text-muted small mt-2">
                      Please transfer the amount to our bank account within 24
                      hours to process your order.
                    </div>
                  )}
                </div>
              </div>

              {/* Order notes */}
              {orderNotes && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Order Notes</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{orderNotes}</p>
                  </div>
                </div>
              )}

              {/* Order summary */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span>₫{formatPrice(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Shipping</span>
                    <span>₫{formatPrice(shipping)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount ({discountData.code})</span>
                      <span>-₫{formatPrice(discount)}</span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Loyalty Points ({loyaltyPoints.used} points)</span>
                      <span>-₫{formatPrice(pointsDiscount)}</span>
                    </div>
                  )}

                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span className="fs-5">₫{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Show guest email in review step */}
              {isGuestCheckout && currentStep === 3 && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Contact Information</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">
                      <i className="bi bi-envelope me-2 text-muted"></i>
                      {guestEmail}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="d-flex justify-content-between">
          {currentStep > 1 ? (
            <button
              className="btn btn-outline-secondary"
              onClick={prevStep}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-2"></i>Back
            </button>
          ) : (
            <div></div> // Empty div for spacing
          )}

          {/* Only show the Continue button for steps after shipping (step 1) */}
          {currentStep < totalSteps && currentStep !== 1 ? (
            <button
              className="btn btn-danger"
              onClick={(e) => {
                e.preventDefault();
                nextStep();
              }}
            >
              Continue<i className="bi bi-arrow-right ms-2"></i>
            </button>
          ) : currentStep === totalSteps ? (
            <button
              className="btn btn-danger"
              onClick={placeOrder}
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </span>
              ) : (
                <span>
                  Place Order<i className="bi bi-check2-circle ms-2"></i>
                </span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
