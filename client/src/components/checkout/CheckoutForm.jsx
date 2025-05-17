import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import orderService from "../../services/order.service";
import userService from "../../services/user.service";

/**
 * Checkout form component handling the complete checkout process
 * Supports loyalty points, discounts, and multiple payment methods
 *
 * @param {Object} props Component props
 * @param {String} props.discountCode Optional discount code passed from cart
 * @param {Boolean} props.usingLoyaltyPoints Whether loyalty points should be used
 * @param {Number} props.loyaltyPoints Number of loyalty points to use (passed from cart)
 * @param {Function} props.onOrderSuccess Callback when order is successful
 * @param {Boolean} props.isGuestCheckout Whether this is a guest checkout
 */
const CheckoutForm = ({
  discountCode,
  usingLoyaltyPoints,
  loyaltyPoints: initialLoyaltyPoints,
  onOrderSuccess,
  isGuestCheckout = false,
}) => {
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Get state params from location if they exist
  const locationState = location.state || {};
  const discountCodeFromState = locationState.discountCode;
  const discountAmountFromState = locationState.discountAmount || 0;
  const usingPointsFromState = locationState.usingLoyaltyPoints;
  const pointsFromState = locationState.loyaltyPoints;

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
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
  // Order summary states - prioritize location state, then props, then defaults
  const [discountData, setDiscountData] = useState({
    code: discountCodeFromState || discountCode || "",
    amount: discountAmountFromState || 0,
  }); // Initialize loyalty points state, prioritizing location state over props
  // Use the pointsValue directly when available instead of calculating it
  const initialValue =
    locationState.pointsValue ||
    (pointsFromState > 0 ? pointsFromState * 1000 : 0);

  // Only consider points valid if the pointsValue is also set
  const validPointsFromState =
    pointsFromState > 0 && locationState.pointsValue > 0;

  const [loyaltyPoints, setLoyaltyPoints] = useState({
    available: 0,
    used: validPointsFromState ? pointsFromState : 0,
    value: validPointsFromState ? initialValue : 0,
  });

  // Initialize using loyalty points state, prioritizing location state over props
  // Only enable loyalty points if the user actually has points available and some are being used
  const hasPointsToUse =
    validPointsFromState ||
    (usingLoyaltyPoints === true && initialLoyaltyPoints > 0);
  const [usingLoyaltyPointsState, setUsingLoyaltyPointsState] = useState(
    (usingPointsFromState || usingLoyaltyPoints) && hasPointsToUse
  );

  // Log checkout initialization state
  useEffect(() => {
    console.log("Checkout loyalty points initialization:", {
      usingPointsFromState,
      pointsFromState,
      pointsValue: locationState.pointsValue,
      usingLoyaltyPoints: usingLoyaltyPointsState,
    });
  }, []);
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
  }, [isAuthenticated, user]); // Enhance the useEffect that handles discount code and location state
  useEffect(() => {
    // Always prioritize state from navigation first - from cart page
    if (discountCodeFromState) {
      console.log(
        `Using discount code from state: ${discountCodeFromState} with amount: ${discountAmountFromState}`
      );

      // Even if we have a code without an amount, keep the code and try to verify it
      if (discountAmountFromState > 0) {
        // Just set the discount data directly without verifying
        setDiscountData({
          code: discountCodeFromState,
          amount: discountAmountFromState,
        });
      } else if (cart.total > 0) {
        // If we have a code but no amount, we need to verify it
        console.log(
          `Verifying discount code from state: ${discountCodeFromState}`
        );
        verifyDiscountCode(discountCodeFromState);
      }
    }
    // If no state from navigation, fall back to prop
    else if (discountCode && cart.total > 0) {
      console.log(`Verifying discount code from props: ${discountCode}`);
      verifyDiscountCode(discountCode);
    }

    // Handle loyalty points from location state
    if (locationState.pointsValue > 0 && locationState.loyaltyPoints > 0) {
      console.log("Setting loyalty points from location state:", {
        points: locationState.loyaltyPoints,
        value: locationState.pointsValue,
        usingPoints: locationState.usingLoyaltyPoints,
      });

      setLoyaltyPoints((prevPoints) => ({
        ...prevPoints,
        used: locationState.loyaltyPoints,
        value: locationState.pointsValue,
      }));

      setUsingLoyaltyPointsState(!!locationState.usingLoyaltyPoints);
    }
  }, [
    discountCode,
    discountCodeFromState,
    discountAmountFromState,
    cart.total,
    locationState,
  ]);
  // Calculate loyalty points usage
  useEffect(() => {
    if (usingLoyaltyPointsState && loyaltyPoints.available > 0) {
      // Calculate maximum points value based on available points and cart subtotal
      const maxPointsValue = Math.min(
        loyaltyPoints.available * 1000,
        cart.subtotal - (discountData.amount || 0)
      );

      // Calculate how many whole points can be used
      const pointsToUse = Math.floor(maxPointsValue / 1000);

      setLoyaltyPoints((prev) => ({
        ...prev,
        used: pointsToUse,
        value: pointsToUse * 1000,
      }));

      console.log(
        `Loyalty points calculation: ${pointsToUse} points = ₫${
          pointsToUse * 1000
        }`
      );
    }
  }, [
    usingLoyaltyPointsState,
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
  }; // Fetch loyalty points
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await userService.getLoyaltyPoints();

      if (response.success) {
        const availablePoints = response.data.loyaltyPoints || 0;

        // Calculate how many points to use if usingLoyaltyPointsState is true
        let pointsUsed = 0;
        let pointsValue = 0;

        if (usingLoyaltyPointsState && availablePoints > 0) {
          // If passed loyaltyPoints value from cart, use it, otherwise use all available points
          pointsUsed = Math.min(
            loyaltyPoints.used || availablePoints,
            availablePoints
          );
          pointsValue = pointsUsed * 1000;
        }

        setLoyaltyPoints((prev) => ({
          ...prev,
          available: availablePoints,
          used: usingLoyaltyPointsState ? pointsUsed : 0,
          value: usingLoyaltyPointsState ? pointsValue : 0,
        }));

        console.log(
          `Fetched loyalty points: ${availablePoints} available, ${pointsUsed} used, value: ₫${pointsValue}`
        );
      }
    } catch (error) {
      console.error("Error fetching loyalty points:", error);
    }
  }; // Verify discount code
  const verifyDiscountCode = async (code) => {
    if (!code || !cart.total) return;

    try {
      console.log(`Verifying discount code: ${code}`);
      const response = await orderService.verifyDiscount(code);

      if (response.success) {
        const newDiscountAmount = response.data.discountAmount || 0;
        console.log(
          `Discount code ${code} verified. Amount: ${newDiscountAmount}`
        );

        setDiscountData({
          code: code,
          amount: newDiscountAmount,
        });

        // When discount changes, recalculate loyalty points if they're being used
        if (usingLoyaltyPointsState && loyaltyPoints.available > 0) {
          // Use setTimeout to ensure the state has been updated
          setTimeout(() => {
            recalculateLoyaltyPoints();
          }, 0);
        }

        return true;
      } else {
        console.log(`Invalid discount code: ${code}`);
        // Invalid discount code, clear it
        setDiscountData({
          code: "",
          amount: 0,
        });

        return false;
      }
    } catch (error) {
      console.error("Error verifying discount code:", error);
      setDiscountData({
        code: "",
        amount: 0,
      });

      return false;
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
  }; // Calculate totals
  const subtotal = cart.subtotal || 0;
  const shipping = 35000; // Fixed shipping fee in VND
  const discount = discountData.amount || 0;

  // Only apply loyalty points discount if using points and there's actual value
  // Make sure we don't show negative values or apply points when there are none
  const pointsDiscount =
    usingLoyaltyPointsState && loyaltyPoints.value && loyaltyPoints.value > 0
      ? loyaltyPoints.value
      : 0;

  // Ensure the total doesn't go below zero
  const total = Math.max(0, subtotal + shipping - discount - pointsDiscount);
  // Format currency
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  }; // Add debug logging to track discount and loyalty points state
  useEffect(() => {
    console.log("Checkout state updated:", {
      locationState: {
        discountCode: locationState.discountCode,
        discountAmount: locationState.discountAmount,
      },
      propDiscountCode: discountCode,
      currentDiscountData: {
        code: discountData.code,
        amount: discountData.amount,
      },
      usingLoyaltyPoints: usingLoyaltyPointsState,
      loyaltyPoints: {
        available: loyaltyPoints.available,
        used: loyaltyPoints.used,
        value: loyaltyPoints.value,
      },
      subtotal,
      shipping,
      discount,
      pointsDiscount,
      total,
    });
  }, [
    locationState,
    discountCode,
    discountData,
    usingLoyaltyPointsState,
    loyaltyPoints,
    subtotal,
    discount,
    pointsDiscount,
    total,
  ]);

  // Helper function to recalculate loyalty points
  const recalculateLoyaltyPoints = () => {
    if (!usingLoyaltyPointsState || loyaltyPoints.available <= 0) {
      return { used: 0, value: 0 };
    }

    const maxApplicableAmount = Math.max(
      0,
      cart.subtotal - (discountData.amount || 0)
    );
    const maxPointsValue = Math.min(
      loyaltyPoints.available * 1000,
      maxApplicableAmount
    );
    const pointsToUse = Math.floor(maxPointsValue / 1000);

    if (pointsToUse <= 0) {
      return { used: 0, value: 0 };
    }

    // Update state immediately
    setLoyaltyPoints((prev) => ({
      ...prev,
      used: pointsToUse,
      value: pointsToUse * 1000,
    }));

    return { used: pointsToUse, value: pointsToUse * 1000 };
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
    } // Prepare order data
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
        saveAddress: shippingAddress.saveAddress || false, // Include the saveAddress flag
      },
      paymentMethod,
      discountCode: discountData.code || null,
      loyaltyPointsUsed: usingLoyaltyPointsState ? loyaltyPoints.used || 0 : 0,
      notes: orderNotes,
      email: isGuestCheckout ? guestEmail : undefined,
    };

    // Log the order data to verify loyalty points are included
    console.log(
      "Using loyalty points:",
      usingLoyaltyPointsState,
      "Points used:",
      loyaltyPoints.used
    );

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

  // Add the logging useEffect inside the component
  useEffect(() => {
    console.log("Current checkout state:", {
      step: currentStep,
      discount: {
        code: discountData.code,
        amount: discountData.amount,
      },
      loyaltyPoints: {
        available: loyaltyPoints.available,
        used: loyaltyPoints.used,
        value: loyaltyPoints.value,
        enabled: usingLoyaltyPointsState,
      },
      subtotal,
      shipping,
      total,
    });
  }, [
    currentStep,
    discountData,
    loyaltyPoints,
    usingLoyaltyPointsState,
    subtotal,
    total,
  ]);

  // Component mount initialization effect
  useEffect(() => {
    console.log("CheckoutForm initialized with:", {
      locationState: {
        discountCode: locationState.discountCode,
        discountAmount: locationState.discountAmount,
      },
      propDiscountCode: discountCode,
    });

    // If no discount code is present, but we have an amount, log an error
    if (!locationState.discountCode && locationState.discountAmount > 0) {
      console.error("Discount amount present without discount code");
    }
  }, []);

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
          )}{" "}
          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div>
              <h4 className="mb-3">Payment Method</h4>
              <PaymentForm
                selectedMethod={paymentMethod}
                onSelectMethod={handlePaymentMethodChange}
              />{" "}
              {/* Loyalty Points Option - only show for authenticated users with points */}
              {isAuthenticated && loyaltyPoints.available > 0 && (
                <div className="card border-0 shadow-sm mt-4 mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 card-title">
                      <i className="bi bi-star-fill me-2 text-warning"></i>
                      Loyalty Points
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      {" "}
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="useLoyaltyPoints"
                          checked={usingLoyaltyPointsState}
                          disabled={loyaltyPoints.available <= 0}
                          onChange={() => {
                            // Don't allow enabling if no points available
                            if (
                              !usingLoyaltyPointsState &&
                              loyaltyPoints.available <= 0
                            ) {
                              return;
                            }

                            const newState = !usingLoyaltyPointsState;
                            setUsingLoyaltyPointsState(newState);

                            // Update loyalty points values based on toggle
                            if (newState) {
                              // Make sure we don't apply more points than the subtotal after discount
                              const maxApplicableAmount = Math.max(
                                0,
                                cart.subtotal - (discountData.amount || 0)
                              );
                              const maxPointsValue = Math.min(
                                loyaltyPoints.available * 1000,
                                maxApplicableAmount
                              );
                              const pointsToUse = Math.floor(
                                maxPointsValue / 1000
                              );

                              console.log(
                                `Calculating points: Max applicable: ₫${maxApplicableAmount}, Points value: ₫${maxPointsValue}, Points to use: ${pointsToUse}`
                              );

                              // Only set points if we actually have some to use
                              if (pointsToUse > 0) {
                                setLoyaltyPoints((prev) => ({
                                  ...prev,
                                  used: pointsToUse,
                                  value: pointsToUse * 1000,
                                }));
                                console.log(
                                  `Enabling ${pointsToUse} loyalty points worth ₫${
                                    pointsToUse * 1000
                                  }`
                                );
                              } else {
                                // No points can be applied (maybe due to discount)
                                setUsingLoyaltyPointsState(false);
                                console.log(
                                  "Cannot apply any points due to discount or zero subtotal"
                                );
                              }
                            } else {
                              setLoyaltyPoints((prev) => ({
                                ...prev,
                                used: 0,
                                value: 0,
                              }));
                              console.log("Disabling loyalty points");
                            }
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="useLoyaltyPoints"
                        >
                          Use my loyalty points ({loyaltyPoints.available}{" "}
                          available)
                        </label>
                      </div>
                      <span className="badge bg-primary rounded-pill">
                        {loyaltyPoints.available} points available
                      </span>
                    </div>{" "}
                    {usingLoyaltyPointsState && (
                      <div className="mt-3">
                        <div className="text-muted small mb-2">
                          <i className="bi bi-info-circle me-2"></i>1 point =
                          ₫1,000 discount
                        </div>
                        {loyaltyPoints.used > 0 ? (
                          <div className="alert alert-success py-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>Points to use: {loyaltyPoints.used}</span>
                              <span>
                                Value: ₫{formatPrice(loyaltyPoints.value)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="alert alert-warning py-2">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              <span>
                                No points can be applied due to discount amount
                                or cart value
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            <div className="row">
              <div className="col-lg-8">
                <h4 className="mb-3">Review Your Order</h4>
                {/* Order items */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      Order Items ({cart.itemCount || 0})
                    </h5>
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
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
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
                )}{" "}
              </div>

              <div className="col-lg-4">
                {/* Consolidated Order Summary */}
                <div className="card mb-4 border-0 shadow-sm">
                  <div
                    className="card-header bg-gradient"
                    style={{
                      background: "linear-gradient(45deg, #dc3545, #fd7e14)",
                    }}
                  >
                    <h5 className="mb-0 text-white">
                      <i className="bi bi-receipt me-2"></i>
                      Order Summary
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">
                        Subtotal ({cart.itemCount} items)
                      </span>
                      <span className="fw-medium">
                        ₫{formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">Shipping</span>
                      <span className="fw-medium">
                        ₫{formatPrice(shipping)}
                      </span>
                    </div>

                    {/* Always show discount when code exists, even if amount is 0 */}
                    {(discountData.code || discount > 0) && (
                      <div className="d-flex justify-content-between mb-3 text-success">
                        <span className="d-flex align-items-center">
                          <i className="bi bi-tag-fill me-2"></i>
                          Discount
                          {discountData.code && (
                            <span className="ms-2">({discountData.code})</span>
                          )}
                        </span>
                        <span className="fw-medium">
                          -₫{formatPrice(discount)}
                        </span>
                      </div>
                    )}

                    {/* Only show loyalty points when they're being used and have value */}
                    {usingLoyaltyPointsState && loyaltyPoints.used > 0 && (
                      <div className="d-flex justify-content-between mb-3 text-success">
                        <span className="d-flex align-items-center">
                          <i className="bi bi-star-fill me-2"></i>
                          Loyalty Points ({loyaltyPoints.used} points)
                        </span>
                        <span className="fw-medium">
                          -₫{formatPrice(pointsDiscount)}
                        </span>
                      </div>
                    )}

                    <hr className="mt-2 mb-3" />
                    <div className="d-flex justify-content-between fw-bold">
                      <span className="fs-5">Total</span>
                      <span className="fs-4 text-danger">
                        ₫{formatPrice(total)}
                      </span>
                    </div>

                    {/* Place Order Button - Mobile View Only */}
                    <div className="d-block d-lg-none mt-4">
                      <button
                        className="btn btn-danger w-100"
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
                            Place Order
                            <i className="bi bi-check2-circle ms-2"></i>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        {/* Navigation buttons */}
        <div className="d-flex flex-wrap mt-4 pt-2 gap-3">
          {/* Back to cart option is always available at step 1 */}
          {currentStep === 1 ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/cart")}
            >
              <i className="bi bi-cart me-2"></i>
              Return to Cart
            </button>
          ) : (
            <button
              className="btn btn-outline-secondary"
              onClick={prevStep}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-2"></i>Back
            </button>
          )}{" "}
          {/* Next/Continue button or Place Order button */}
          <div className="ms-auto">
            {/* Special case for step 1 */}
            {currentStep === 1 && (
              <button
                className="btn btn-danger"
                onClick={nextStep}
                disabled={loading}
              >
                Continue to Payment
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <button
                className="btn btn-danger"
                onClick={nextStep}
                disabled={loading}
              >
                Review Order
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            )}

            {/* Final step - Place Order button */}
            {currentStep === totalSteps && (
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
                    Place Order
                    <i className="bi bi-check2-circle ms-2"></i>
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
