import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import discountService from "../../services/discount.service"; // Import the discount service
import { Accordion } from "react-bootstrap"; // Import Accordion

/**
 * Cart summary component displaying cart totals, discount code input, and checkout button
 * Enhanced with Bootstrap 5 utilities for vibrant, colorful design and proper loyalty points handling
 */
const CartSummary = ({
  onApplyDiscount,
  discountCode,
  discountAmount,
  loyaltyPoints,
}) => {
  const { cart, applyLoyaltyPoints } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(discountCode || "");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [discountSuccess, setDiscountSuccess] = useState("");
  const [usingLoyaltyPoints, setUsingLoyaltyPoints] = useState(!!loyaltyPoints);
  const [pointsToUse, setPointsToUse] = useState(loyaltyPoints || 0);
  const [loyaltyPointsEffect, setLoyaltyPointsEffect] = useState(null);
  const [applyingPoints, setApplyingPoints] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState([]); // State for available discounts
  const [loadingDiscounts, setLoadingDiscounts] = useState(false); // State for loading discounts

  // Format price with comma for thousands and currency symbol
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Calculate cart totals
  const subtotal = cart.subtotal || 0;
  const shipping = 35000; // Default shipping fee in VND

  // Calculate user loyalty points value (if authenticated)
  const availableLoyaltyPoints = isAuthenticated
    ? user?.loyaltyPoints || cart.userLoyaltyPoints || 0
    : 0;

  // Use loyalty points effect or calculate directly for preview
  const pointsValue = loyaltyPointsEffect
    ? loyaltyPointsEffect.pointsValue
    : usingLoyaltyPoints && isAuthenticated
    ? Math.min(pointsToUse * 1000, subtotal - (discountAmount || 0))
    : 0;

  // Calculate final total
  const total = Math.max(
    0,
    subtotal + shipping - (discountAmount || 0) - pointsValue
  );

  // Handle discount code input
  const handleDiscountChange = (e) => {
    const newCode = e.target.value.toUpperCase();
    setCode(newCode);

    // Clear any previous errors when typing
    if (discountError) {
      setDiscountError("");
    }

    // Clear success message when changing code
    if (discountSuccess && newCode !== discountCode) {
      setDiscountSuccess("");
    }
  };

  // Handle apply discount
  const handleApplyDiscount = async () => {
    if (!code.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    // Basic client-side validation for 5-character alphanumeric code
    const codeRegex = /^[A-Z0-9]{5}$/;
    if (!codeRegex.test(code)) {
      setDiscountError("Discount code must be 5 alphanumeric characters");
      return;
    }

    setApplyingDiscount(true);
    setDiscountError("");

    try {
      const result = await onApplyDiscount(code);
      if (result.success) {
        setDiscountSuccess(`Code "${code}" applied successfully!`);

        // Recalculate loyalty points effect if points are being used
        if (usingLoyaltyPoints && pointsToUse > 0) {
          handleApplyLoyaltyPoints();
        }
      } else {
        setDiscountError(result.message || "Invalid discount code");
      }
    } catch (error) {
      setDiscountError("Error applying discount code");
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Handle loyalty points input change
  const handlePointsChange = (e) => {
    let points = parseInt(e.target.value, 10);

    // Validate input - ensure it's a number and not greater than available points
    if (isNaN(points) || points < 0) {
      points = 0;
    } else if (points > availableLoyaltyPoints) {
      points = availableLoyaltyPoints;
    }

    setPointsToUse(points);
  };

  // Handle loyalty points toggle
  const handleLoyaltyPointsToggle = () => {
    const newState = !usingLoyaltyPoints;
    setUsingLoyaltyPoints(newState);

    // If turning on points, calculate effect
    if (newState && availableLoyaltyPoints > 0) {
      handleApplyLoyaltyPoints();
    } else {
      // If turning off points, clear effect
      setLoyaltyPointsEffect(null);
    }
  };
  // Apply loyalty points to see effect
  const handleApplyLoyaltyPoints = async () => {
    if (!isAuthenticated || !usingLoyaltyPoints) {
      setLoyaltyPointsEffect(null);
      return;
    }

    // If pointsToUse is 0, don't waste time with API call
    if (pointsToUse <= 0) {
      setLoyaltyPointsEffect({
        pointsApplied: 0,
        pointsValue: 0,
      });
      return;
    }

    setApplyingPoints(true);

    try {
      console.log(`Applying ${pointsToUse} loyalty points...`);
      const result = await applyLoyaltyPoints(pointsToUse);

      if (result.success) {
        setLoyaltyPointsEffect(result.data);
      } else {
        toast.error(result.error || "Could not apply loyalty points");
        setLoyaltyPointsEffect(null);
      }
    } catch (error) {
      console.error("Error applying loyalty points", error);
      setLoyaltyPointsEffect(null);
    } finally {
      setApplyingPoints(false);
    }
  };

  // Apply loyalty points when points to use changes and toggle is on
  useEffect(() => {
    if (usingLoyaltyPoints && isAuthenticated) {
      const delayDebounceFn = setTimeout(() => {
        handleApplyLoyaltyPoints();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [pointsToUse, usingLoyaltyPoints, discountAmount]); // Handle proceed to checkout

  // Fetch available discounts on component mount
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoadingDiscounts(true);
      try {
        const response = await discountService.getAvailableDiscounts();
        if (response.success) {
          setAvailableDiscounts(response.data.discountCodes || []);
        } else {
          console.error(
            "Failed to fetch available discounts:",
            response.message
          );
          toast.error("Could not load available discounts.");
        }
      } catch (error) {
        console.error("Error fetching available discounts:", error);
        toast.error("Error loading available discounts.");
      } finally {
        setLoadingDiscounts(false);
      }
    };

    fetchDiscounts();
  }, []);

  // Handle proceed to checkout
  const handleCheckout = () => {
    // If cart is empty, prevent checkout
    if (!cart.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Calculate the actual loyalty points value that should be used
    // Only use loyalty points if the toggle is on AND we have a positive points effect
    const shouldUsePoints =
      usingLoyaltyPoints &&
      loyaltyPointsEffect &&
      loyaltyPointsEffect.pointsValue > 0;

    const finalPointsValue = shouldUsePoints
      ? loyaltyPointsEffect.pointsValue
      : 0;
    const finalPointsToUse = shouldUsePoints ? pointsToUse : 0;

    // Only pass usingLoyaltyPoints flag if we actually have points to use
    const finalUsingLoyaltyPoints = shouldUsePoints;

    console.log("Proceeding to checkout with:", {
      discountCode,
      discountAmount,
      usingLoyaltyPoints: finalUsingLoyaltyPoints,
      loyaltyPoints: finalPointsToUse,
      pointsValue: finalPointsValue,
    }); // Redirect to checkout page with applied discount and loyalty points
    navigate("/checkout", {
      state: {
        discountCode: discountCode,
        discountAmount: discountAmount,
        usingLoyaltyPoints: finalUsingLoyaltyPoints,
        loyaltyPoints: finalPointsToUse,
        pointsValue: finalPointsValue,
      },
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      {/* Colorful header with gradient */}
      <div
        className="card-header border-0 py-3"
        style={{ background: "linear-gradient(45deg, #dc3545, #fd7e14)" }}
      >
        <h5 className="card-title mb-0 text-white fw-bold">
          <i className="bi bi-receipt me-2"></i>
          Order Summary
        </h5>
      </div>

      <div className="card-body p-4">
        {/* Cart totals with enhanced styling */}
        <ul className="list-group list-group-flush mb-4">
          <li className="list-group-item d-flex justify-content-between px-0 py-3 border-0">
            <span className="text-muted">Subtotal</span>
            <span className="fw-medium">₫{formatPrice(subtotal)}</span>
          </li>

          <li className="list-group-item d-flex justify-content-between px-0 py-3 border-0">
            <span className="text-muted">Shipping</span>
            <span className="fw-medium">₫{formatPrice(shipping)}</span>
          </li>

          {discountAmount > 0 && (
            <li className="list-group-item d-flex justify-content-between px-0 py-3 border-0">
              <span className="text-success d-flex align-items-center">
                <i className="bi bi-tag-fill me-2"></i>
                Discount
                {discountCode && <span className="ms-2">({discountCode})</span>}
              </span>
              <span className="text-success fw-medium">
                -₫{formatPrice(discountAmount)}
              </span>
            </li>
          )}

          {isAuthenticated && pointsValue > 0 && (
            <li className="list-group-item d-flex justify-content-between px-0 py-3 border-0">
              <span className="text-success d-flex align-items-center">
                <i className="bi bi-star-fill me-2"></i>
                Loyalty Points
                <span className="ms-2">({pointsToUse} points)</span>
              </span>
              <span className="text-success fw-medium">
                -₫{formatPrice(pointsValue)}
              </span>
            </li>
          )}

          <li className="list-group-item d-flex justify-content-between px-0 py-3 mt-2 border-top border-2">
            <span className="fw-bold fs-5">Total</span>
            <span className="fw-bold fs-4 text-danger">
              ₫{formatPrice(total)}
            </span>
          </li>
        </ul>

        {/* Discount code with colorful validation */}
        <div className="mb-4 p-3 bg-light rounded-3">
          <label htmlFor="discountCode" className="form-label fw-medium mb-2">
            <i className="bi bi-ticket-perforated-fill me-2 text-primary"></i>
            Discount Code
          </label>
          <div className="input-group">
            <input
              type="text"
              id="discountCode"
              className={`form-control ${
                discountError ? "is-invalid" : discountSuccess ? "is-valid" : ""
              }`}
              value={code}
              onChange={handleDiscountChange}
              placeholder="Enter 5-character code"
              maxLength={5}
            />
            <button
              className="btn btn-primary fw-medium"
              type="button"
              onClick={handleApplyDiscount}
              disabled={applyingDiscount || !code.trim() || code.length !== 5}
            >
              {applyingDiscount ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
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
            <div className="text-danger mt-2 d-flex align-items-center small">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {discountError}
            </div>
          )}

          {discountSuccess && (
            <div className="text-success mt-2 d-flex align-items-center small">
              <i className="bi bi-check-circle-fill me-2"></i>
              {discountSuccess}
            </div>
          )}
        </div>

        {/* Available Discounts Accordion */}
        {availableDiscounts.length > 0 && (
          <Accordion className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <i className="bi bi-gift-fill me-2 text-primary"></i>
                Available Discounts
              </Accordion.Header>
              <Accordion.Body>
                {loadingDiscounts ? (
                  <p>Loading discounts...</p>
                ) : (
                  <ul className="list-unstyled">
                    {availableDiscounts.map((d) => (
                      <li
                        key={d.code}
                        className="mb-2 p-2 border rounded bg-white"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-success">{d.code}</strong>
                            <small className="d-block text-muted">
                              {d.discountType === "percentage"
                                ? `${d.discountValue}% off`
                                : `₫${d.discountValue.toLocaleString()} off`}
                            </small>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setCode(d.code);
                              toast.info(
                                `Discount code "${d.code}" copied to input.`
                              );
                            }}
                          >
                            Use Code
                          </Button>
                        </div>
                        <small className="text-muted d-block mt-1">
                          {d.usageLimit - d.usedCount} uses remaining
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}

        {/* Loyalty points with badge and visual enhancement */}
        {isAuthenticated && availableLoyaltyPoints > 0 && (
          <div className="mb-4 p-3 bg-light rounded-3">
            <div className="mb-3 d-flex align-items-center">
              <div className="form-check me-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="useLoyaltyPoints"
                  checked={usingLoyaltyPoints}
                  onChange={handleLoyaltyPointsToggle}
                />
                <label
                  className="form-check-label fw-medium"
                  htmlFor="useLoyaltyPoints"
                >
                  Use loyalty points
                </label>
              </div>
              <div className="ms-auto">
                <span className="badge bg-primary rounded-pill">
                  {availableLoyaltyPoints} points available
                </span>
              </div>
            </div>

            {usingLoyaltyPoints && (
              <div className="mt-2">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max={availableLoyaltyPoints}
                    value={pointsToUse}
                    onChange={handlePointsChange}
                    disabled={applyingPoints}
                  />
                  <span className="input-group-text">points</span>
                </div>
                <div className="mt-2 d-flex justify-content-between align-items-center small">
                  <span className="text-muted">1 point = ₫1,000 discount</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setPointsToUse(availableLoyaltyPoints)}
                  >
                    Use all points
                  </button>
                </div>
                {applyingPoints && (
                  <div className="text-primary mt-2 small">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Calculating...
                  </div>
                )}
                {loyaltyPointsEffect && (
                  <div className="alert alert-success mt-2 py-2 px-3 small mb-0">
                    <div className="d-flex justify-content-between">
                      <span>Points value:</span>
                      <span>
                        ₫{formatPrice(loyaltyPointsEffect.pointsValue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Checkout button with animation effects */}
        <div className="d-grid gap-3 mt-4">
          <Button
            variant="danger"
            size="large"
            fullWidth
            onClick={handleCheckout}
            disabled={!cart.items || cart.items.length === 0}
            className="py-3 fw-bold shadow-sm"
          >
            <i className="bi bi-credit-card me-2"></i>
            Proceed to Checkout
          </Button>

          <Link
            to="/products"
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center py-2"
          >
            <i className="bi bi-arrow-left-circle me-2"></i>
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Colorful footer with shipping note */}
      <div className="card-footer bg-light py-3 text-center border-0">
        <small className="text-muted d-flex align-items-center justify-content-center">
          <i className="bi bi-truck me-2 text-primary"></i>
          Free shipping for orders above ₫500,000
        </small>
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
