import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import CheckoutForm from "../components/checkout/CheckoutForm";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

/**
 * Checkout page component
 * Handles the checkout process including address selection, payment method, and order confirmation
 */
const CheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    cart,
    loading: cartLoading,
    error: cartError,
    refreshCart,
  } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuestCheckout, setIsGuestCheckout] = useState(!isAuthenticated); // State variable for guest checkout

  // Get discount and loyalty points info from location state (from CartPage)
  const locationState = location.state || {};
  const discountCode = locationState.discountCode || "";
  const usingLoyaltyPoints = locationState.usingLoyaltyPoints || false;

  // Fetch latest cart data
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await refreshCart();
      } catch (err) {
        setError("Failed to load cart data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [refreshCart]);

  // Check if cart is empty, redirect to cart page
  useEffect(() => {
    if (!cartLoading && cart && (!cart.items || cart.items.length === 0)) {
      navigate("/cart", { replace: true });
    }
  }, [cart, cartLoading, navigate]);

  // Handle successful order completion
  const handleOrderSuccess = (orderData) => {
    // Navigate to the order confirmation page with order data
    navigate(`/orders/${orderData.id}`, {
      state: {
        isNewOrder: true,
        orderData: orderData,
      },
    });
  };

  // Loading state
  if (loading || cartLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <Loader text="Preparing checkout..." centered />
        </div>
      </div>
    );
  }

  // Error state
  if (error || cartError) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <Card>
              <h1 className="h3 fw-bold text-center mb-4">Checkout</h1>

              <div className="alert alert-danger mb-4" role="alert">
                <p className="mb-0">{error || cartError}</p>
              </div>

              <div className="text-center">
                <Button variant="primary" onClick={() => navigate("/cart")}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Return to Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container py-5">
      <h1 className="h3 fw-bold mb-4">Checkout</h1>
      <div className="row">
        {/* Full-width checkout form */}
        <div className="col-12">
          <CheckoutForm
            discountCode={discountCode}
            usingLoyaltyPoints={usingLoyaltyPoints}
            onOrderSuccess={handleOrderSuccess}
            isGuestCheckout={isGuestCheckout}
          />

          {/* The "Return to Cart" button is already included inside the CheckoutForm component */}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
