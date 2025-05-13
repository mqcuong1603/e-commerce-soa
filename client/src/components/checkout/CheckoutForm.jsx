import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import Button from "../ui/Button";
import orderService from "../../services/order.service";
import userService from "../../services/user.service";

const CheckoutForm = () => {
  const { cart, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State from previous page (if any)
  const { discountCode, usingLoyaltyPoints } = location.state || {};

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(!isAuthenticated);
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

  // Handle next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step
      if (currentStep === 1) {
        // Validate shipping address
        if (!selectedAddressId && !validateAddressForm()) {
          return;
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

  // Validate address form
  const validateAddressForm = () => {
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
      if (!addressFormData[field]) {
        setError(`Please fill in all required address fields`);
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
      shippingAddress,
      paymentMethod,
      discountCode: discountData.code || null,
      loyaltyPointsUsed: loyaltyPoints.used || 0,
      notes: orderNotes,
    };

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
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order Number:</p>
              <p className="font-semibold">{orderData.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date:</p>
              <p className="font-semibold">
                {new Date(orderData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method:</p>
              <p className="font-semibold">
                {paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : paymentMethod === "bank"
                  ? "Bank Transfer"
                  : paymentMethod === "credit"
                  ? "Credit Card"
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount:</p>
              <p className="font-semibold">₫{formatPrice(orderData.total)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            variant="primary"
            onClick={() => navigate(`/orders/${orderData._id}`)}
          >
            View Order Details
          </Button>

          <Button variant="outlined" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Progress steps */}
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
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex mb-8 text-sm">
        <div
          className={`flex-1 text-center ${
            currentStep === 1 ? "font-semibold text-primary-600" : ""
          }`}
        >
          Shipping
        </div>
        <div
          className={`flex-1 text-center ${
            currentStep === 2 ? "font-semibold text-primary-600" : ""
          }`}
        >
          Payment
        </div>
        <div
          className={`flex-1 text-center ${
            currentStep === 3 ? "font-semibold text-primary-600" : ""
          }`}
        >
          Review
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Main content based on current step */}
      <div className="mb-8">
        {/* Step 1: Shipping Address */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>

            {/* Address selection for logged in users */}
            {isAuthenticated && addresses.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Saved Addresses</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {showAddressForm ? "Use Saved Address" : "Add New Address"}
                  </button>
                </div>

                {!showAddressForm && (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`border p-4 rounded-md cursor-pointer ${
                          selectedAddressId === address._id
                            ? "border-primary-600 bg-primary-50"
                            : "border-gray-300 hover:border-primary-300"
                        }`}
                        onClick={() => setSelectedAddressId(address._id)}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{address.fullName}</div>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          {address.phoneNumber}
                        </div>
                        <div className="text-gray-800 text-sm mt-2">
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Address form (for new addresses or guest checkout) */}
            {(showAddressForm || !isAuthenticated) && (
              <AddressForm
                formData={addressFormData}
                onChange={handleAddressChange}
              />
            )}
          </div>
        )}

        {/* Step 2: Payment Method */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <PaymentForm
              selectedMethod={paymentMethod}
              onSelectMethod={handlePaymentMethodChange}
            />

            {/* Order notes */}
            <div className="mt-6">
              <label
                htmlFor="orderNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Order Notes (Optional)
              </label>
              <textarea
                id="orderNotes"
                name="orderNotes"
                rows="3"
                value={orderNotes}
                onChange={handleNotesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Special instructions for delivery"
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 3: Review Order */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Review Your Order</h2>

            {/* Order items */}
            <div className="border rounded-md mb-6">
              <div className="border-b p-4">
                <h3 className="font-medium">
                  Order Items ({cart.itemCount || 0})
                </h3>
              </div>

              <div className="p-4 divide-y">
                {cart.items &&
                  cart.items.map((item) => {
                    const product = item.productVariantId.productId;
                    const variant = item.productVariantId;

                    return (
                      <div
                        key={item.productVariantId._id}
                        className="py-3 flex items-center"
                      >
                        <div className="flex-shrink-0 w-16 h-16 border rounded-md overflow-hidden">
                          {variant.images && variant.images.length > 0 ? (
                            <img
                              src={variant.images[0].imageUrl}
                              alt={product?.name || "Product"}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="font-medium">
                            {product?.name || "Product"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {variant?.name || "Variant"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ₫{formatPrice(item.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            x{item.quantity}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Shipping address */}
            <div className="border rounded-md mb-6">
              <div className="border-b p-4 flex justify-between items-center">
                <h3 className="font-medium">Shipping Address</h3>
                {currentStep === totalSteps && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="p-4">
                {selectedAddressId ? (
                  // Show selected address
                  (() => {
                    const address = addresses.find(
                      (addr) => addr._id === selectedAddressId
                    );
                    if (!address) return null;

                    return (
                      <div>
                        <div className="font-medium">{address.fullName}</div>
                        <div className="text-gray-600 text-sm">
                          {address.phoneNumber}
                        </div>
                        <div className="text-gray-800 text-sm mt-2">
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
                    <div className="font-medium">
                      {addressFormData.fullName}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {addressFormData.phoneNumber}
                    </div>
                    <div className="text-gray-800 text-sm mt-2">
                      {addressFormData.addressLine1}
                      {addressFormData.addressLine2 && (
                        <span>, {addressFormData.addressLine2}</span>
                      )}
                      <br />
                      {addressFormData.city}, {addressFormData.state}{" "}
                      {addressFormData.postalCode}
                      <br />
                      {addressFormData.country}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="border rounded-md mb-6">
              <div className="border-b p-4 flex justify-between items-center">
                <h3 className="font-medium">Payment Method</h3>
                {currentStep === totalSteps && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Change
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="font-medium">
                  {paymentMethod === "cod" && "Cash on Delivery"}
                  {paymentMethod === "bank" && "Bank Transfer"}
                  {paymentMethod === "credit" && "Credit Card"}
                </div>
                {paymentMethod === "bank" && (
                  <div className="text-gray-600 text-sm mt-2">
                    Please transfer the amount to our bank account within 24
                    hours to process your order.
                  </div>
                )}
              </div>
            </div>

            {/* Order notes */}
            {orderNotes && (
              <div className="border rounded-md mb-6">
                <div className="border-b p-4">
                  <h3 className="font-medium">Order Notes</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-700">{orderNotes}</p>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="border rounded-md mb-6">
              <div className="border-b p-4">
                <h3 className="font-medium">Order Summary</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₫{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>₫{formatPrice(shipping)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountData.code})</span>
                      <span>-₫{formatPrice(discount)}</span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Loyalty Points ({loyaltyPoints.used} points)</span>
                      <span>-₫{formatPrice(pointsDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₫{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        {currentStep > 1 ? (
          <Button variant="outlined" onClick={prevStep} disabled={loading}>
            Back
          </Button>
        ) : (
          <div></div> // Empty div for spacing
        )}

        {currentStep < totalSteps ? (
          <Button variant="primary" onClick={nextStep}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={placeOrder} disabled={loading}>
            {loading ? (
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
                Processing...
              </span>
            ) : (
              "Place Order"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
