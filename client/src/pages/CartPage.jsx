import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import Card from "../components/ui/Card";
import { toast } from "react-toastify";

/**
 * Cart page component with enhanced functionality for discount codes and loyalty points
 * This page displays items in the user's cart and provides a summary with checkout option
 */
const CartPage = () => {
  const {
    cart,
    clearCart,
    loading,
    error,
    refreshCart,
    applyDiscount,
    isAuthenticated,
  } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [cartUpdating, setCartUpdating] = useState(false);
  const navigate = useNavigate();

  // Refresh cart on component mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Handle applying discount code
  const handleApplyDiscount = async (code) => {
    if (!code.trim())
      return { success: false, message: "Please enter a discount code" };

    setApplyingDiscount(true);

    try {
      const result = await applyDiscount(code);

      if (result.success && result.data) {
        setDiscountCode(code);
        setDiscountAmount(result.data.discountAmount || 0);
        return { success: true };
      } else {
        return {
          success: false,
          message: result.error || "Invalid discount code",
        };
      }
    } catch (err) {
      return { success: false, message: "Error applying discount code" };
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Handle user setting loyalty points
  const handleSetLoyaltyPoints = (points) => {
    setLoyaltyPoints(points);
  };

  // Handle clearing the cart with confirmation
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCartUpdating(true);
      try {
        const result = await clearCart();
        if (result.success) {
          // Reset discount and loyalty points if cart is cleared
          setDiscountCode("");
          setDiscountAmount(0);
          setLoyaltyPoints(0);
          toast.success("Cart cleared successfully");
        } else {
          toast.error(result.error || "Error clearing cart");
        }
      } catch (error) {
        toast.error("Failed to clear cart");
      } finally {
        setCartUpdating(false);
      }
    }
  };

  // Loading state
  if (loading && !cart.items) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <Loader text="Loading your cart..." centered />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Card className="p-5 text-center">
              <h1 className="h3 fw-bold mb-4">Your Cart</h1>

              <div className="py-5">
                <i className="bi bi-cart3 text-muted display-1 mb-3"></i>
                <h2 className="h4 fw-bold mb-3">Your cart is empty</h2>
                <p className="text-muted mb-4">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link to="/products">
                  <Button variant="primary" size="large">
                    <i className="bi bi-bag-fill me-2"></i>
                    Start Shopping
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="h3 fw-bold mb-4">Your Cart</h1>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Cart items */}
        <div className="col-lg-8">
          <Card className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold m-0">Cart Items ({cart.itemCount})</h2>
              {cart.items && cart.items.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearCart}
                  disabled={cartUpdating}
                >
                  {cartUpdating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-1"></i>
                      Clear Cart
                    </>
                  )}
                </Button>
              )}
            </div>

            {loading && (
              <div className="text-center py-3">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Updating cart...
              </div>
            )}

            <div>
              {cart.items &&
                cart.items.map((item) => (
                  <CartItem key={item.productVariantId._id} item={item} />
                ))}
            </div>

            <div className="mt-4 d-flex flex-wrap justify-content-between align-items-center">
              <Link to="/products" className="mb-3 mb-md-0">
                <Button variant="outlined">
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </Button>
              </Link>

              {/* Checkout buttons */}
              <div className="d-md-none w-100 mt-3">
                {!isAuthenticated ? (
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        navigate("/checkout", {
                          state: {
                            discountCode,
                            discountAmount,
                            loyaltyPoints,
                          },
                        })
                      }
                    >
                      <i className="bi bi-bag me-2"></i>
                      Checkout as Guest
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        navigate("/login", {
                          state: { from: { pathname: "/checkout" } },
                        })
                      }
                    >
                      Login to Checkout
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      navigate("/checkout", {
                        state: {
                          discountCode,
                          discountAmount,
                          loyaltyPoints,
                        },
                      })
                    }
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Checkout - ₫
                    {(cart.subtotal + 35000 - discountAmount).toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Cart summary */}
        <div className="col-lg-4">
          <CartSummary
            onApplyDiscount={handleApplyDiscount}
            discountCode={discountCode}
            discountAmount={discountAmount}
            loyaltyPoints={loyaltyPoints}
            onSetLoyaltyPoints={handleSetLoyaltyPoints}
          />
        </div>
      </div>

      {/* Related products slider */}
      <div className="mt-5">
        <h3 className="h5 fw-bold mb-4">You might also like</h3>
        <div className="alert alert-light py-5 text-center">
          <p className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Related products based on your cart items will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
