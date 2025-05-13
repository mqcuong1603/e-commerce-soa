import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

/**
 * Cart summary component displaying cart totals, discount code input, and checkout button
 */
const CartSummary = ({
  onApplyDiscount,
  discountCode,
  discountAmount,
  loyaltyPoints,
}) => {
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(discountCode || "");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [usingLoyaltyPoints, setUsingLoyaltyPoints] = useState(!!loyaltyPoints);

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Calculate cart totals
  const subtotal = cart.subtotal || 0;
  const shipping = 35000; // Default shipping fee in VND

  // Calculate user loyalty points value (if authenticated)
  const availableLoyaltyPoints = isAuthenticated
    ? cart.userLoyaltyPoints || 0
    : 0;
  const pointsValue =
    usingLoyaltyPoints && isAuthenticated
      ? Math.min(availableLoyaltyPoints * 1000, subtotal)
      : 0;

  // Calculate final total
  const total = Math.max(
    0,
    subtotal + shipping - (discountAmount || 0) - pointsValue
  );

  // Handle discount code input
  const handleDiscountChange = (e) => {
    setCode(e.target.value.toUpperCase());
    if (discountError) {
      setDiscountError("");
    }
  };

  // Handle apply discount
  const handleApplyDiscount = async () => {
    if (!code.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setApplyingDiscount(true);
    setDiscountError("");

    try {
      const result = await onApplyDiscount(code);
      if (!result.success) {
        setDiscountError(result.message || "Invalid discount code");
      }
    } catch (error) {
      setDiscountError("Error applying discount code");
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Handle loyalty points toggle
  const handleLoyaltyPointsToggle = () => {
    setUsingLoyaltyPoints(!usingLoyaltyPoints);
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    // If cart is empty, prevent checkout
    if (!cart.items || cart.items.length === 0) {
      return;
    }

    // Redirect to checkout page with applied discount and loyalty points
    navigate("/checkout", {
      state: {
        discountCode: discountCode,
        usingLoyaltyPoints: usingLoyaltyPoints,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>

      {/* Cart totals */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₫{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">₫{formatPrice(shipping)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₫{formatPrice(discountAmount)}</span>
          </div>
        )}

        {isAuthenticated && pointsValue > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Loyalty Points</span>
            <span>-₫{formatPrice(pointsValue)}</span>
          </div>
        )}

        <div className="border-t pt-3 mt-3 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-xl">₫{formatPrice(total)}</span>
        </div>
      </div>

      {/* Discount code */}
      <div className="mb-6">
        <label
          htmlFor="discountCode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Discount Code
        </label>
        <div className="flex">
          <input
            type="text"
            id="discountCode"
            value={code}
            onChange={handleDiscountChange}
            placeholder="Enter code"
            className={`flex-grow px-3 py-2 border rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
              discountError ? "border-red-500" : "border-gray-300"
            }`}
          />
          <Button
            variant="primary"
            className="rounded-l-none"
            onClick={handleApplyDiscount}
            disabled={applyingDiscount || !code.trim()}
          >
            {applyingDiscount ? (
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
                Applying...
              </span>
            ) : (
              "Apply"
            )}
          </Button>
        </div>
        {discountError && (
          <p className="mt-1 text-sm text-red-600">{discountError}</p>
        )}
        {discountCode && !discountError && (
          <p className="mt-1 text-sm text-green-600">
            Discount code "{discountCode}" applied successfully!
          </p>
        )}
      </div>

      {/* Loyalty points (only for authenticated users) */}
      {isAuthenticated && availableLoyaltyPoints > 0 && (
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useLoyaltyPoints"
              checked={usingLoyaltyPoints}
              onChange={handleLoyaltyPointsToggle}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="useLoyaltyPoints"
              className="ml-2 block text-sm text-gray-700"
            >
              Use {availableLoyaltyPoints} loyalty points (₫
              {formatPrice(availableLoyaltyPoints * 1000)})
            </label>
          </div>
        </div>
      )}

      {/* Checkout button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleCheckout}
        disabled={!cart.items || cart.items.length === 0}
      >
        Proceed to Checkout
      </Button>

      {/* Continue shopping */}
      <div className="mt-4 text-center">
        <Link
          to="/products"
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

CartSummary.propTypes = {
  onApplyDiscount: PropTypes.func.isRequired,
  discountCode: PropTypes.string,
  discountAmount: PropTypes.number,
  loyaltyPoints: PropTypes.number,
};

CartSummary.defaultProps = {
  discountCode: "",
  discountAmount: 0,
  loyaltyPoints: 0,
};

export default CartSummary;
