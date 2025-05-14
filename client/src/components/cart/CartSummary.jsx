import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

/**
 * Cart summary component displaying cart totals, discount code input, and checkout button
 * Styled with Bootstrap
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
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3">
        <h5 className="card-title mb-0">Order Summary</h5>
      </div>
      <div className="card-body">
        {/* Cart totals */}
        <ul className="list-group list-group-flush mb-3">
          <li className="list-group-item d-flex justify-content-between px-0">
            <span>Subtotal</span>
            <span className="fw-medium">₫{formatPrice(subtotal)}</span>
          </li>

          <li className="list-group-item d-flex justify-content-between px-0">
            <span>Shipping</span>
            <span className="fw-medium">₫{formatPrice(shipping)}</span>
          </li>

          {discountAmount > 0 && (
            <li className="list-group-item d-flex justify-content-between px-0 text-success">
              <span>Discount</span>
              <span>-₫{formatPrice(discountAmount)}</span>
            </li>
          )}

          {isAuthenticated && pointsValue > 0 && (
            <li className="list-group-item d-flex justify-content-between px-0 text-success">
              <span>Loyalty Points</span>
              <span>-₫{formatPrice(pointsValue)}</span>
            </li>
          )}

          <li className="list-group-item d-flex justify-content-between px-0 border-top border-2 py-3">
            <span className="fw-bold">Total</span>
            <span className="fw-bold fs-5 text-danger">
              ₫{formatPrice(total)}
            </span>
          </li>
        </ul>

        {/* Discount code */}
        <div className="mb-4">
          <label htmlFor="discountCode" className="form-label fw-medium">
            Discount Code
          </label>
          <div className="input-group">
            <input
              type="text"
              id="discountCode"
              className={`form-control ${discountError ? "is-invalid" : ""}`}
              value={code}
              onChange={handleDiscountChange}
              placeholder="Enter code"
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleApplyDiscount}
              disabled={applyingDiscount || !code.trim()}
            >
              {applyingDiscount ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {discountError && (
            <div className="invalid-feedback d-block">{discountError}</div>
          )}

          {discountCode && !discountError && (
            <div className="text-success small mt-1">
              <i className="bi bi-check-circle me-1"></i>
              Discount code "{discountCode}" applied successfully!
            </div>
          )}
        </div>

        {/* Loyalty points (only for authenticated users) */}
        {isAuthenticated && availableLoyaltyPoints > 0 && (
          <div className="mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="useLoyaltyPoints"
                checked={usingLoyaltyPoints}
                onChange={handleLoyaltyPointsToggle}
              />
              <label className="form-check-label" htmlFor="useLoyaltyPoints">
                Use {availableLoyaltyPoints} loyalty points
                <span className="text-muted ms-1">
                  (₫{formatPrice(availableLoyaltyPoints * 1000)})
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Checkout button */}
        <div className="d-grid gap-2">
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handleCheckout}
            disabled={!cart.items || cart.items.length === 0}
          >
            <i className="bi bi-credit-card me-2"></i>
            Proceed to Checkout
          </Button>

          <Link to="/products" className="btn btn-link text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i>
            Continue Shopping
          </Link>
        </div>
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
