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

  // Get discount and loyalty points info from location state (from CartPage)
  const locationState = location.state || {};
  const discountCode = locationState.discountCode || "";
  const usingLoyaltyPoints = locationState.usingLoyaltyPoints || false;

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } },
        replace: true,
      });
    }
  }, [isAuthenticated, loading, navigate]);

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

      <div className="row g-4">
        {/* Main checkout form */}
        <div className="col-lg-8">
          <CheckoutForm
            discountCode={discountCode}
            usingLoyaltyPoints={usingLoyaltyPoints}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>

        {/* Order summary */}
        <div className="col-lg-4">
          <Card title="Order Summary">
            {/* Cart items summary */}
            <div className="card-body p-0">
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                <ul className="list-group list-group-flush">
                  {cart?.items?.map((item) => (
                    <li
                      key={item.productVariantId._id}
                      className="list-group-item px-0"
                    >
                      <div className="d-flex align-items-center">
                        <div
                          style={{ width: "60px", height: "60px" }}
                          className="border rounded me-3"
                        >
                          {item.productVariantId.images &&
                          item.productVariantId.images.length > 0 ? (
                            <img
                              src={item.productVariantId.images[0].imageUrl}
                              alt={
                                item.productVariantId.productId?.name ||
                                "Product"
                              }
                              className="img-fluid h-100 w-100 object-fit-contain p-1"
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                              <span className="text-muted small">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-medium small">
                            {item.productVariantId.productId?.name || "Product"}
                          </div>
                          <div className="text-muted small">
                            {item.productVariantId?.name || "Variant"} ×{" "}
                            {item.quantity}
                          </div>
                        </div>
                        <div className="fw-medium">
                          ₫{item.price.toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price details */}
              <div className="border-top pt-3 mt-3">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Subtotal</span>
                    <span>₫{cart?.subtotal?.toLocaleString() || "0"}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted">Shipping</span>
                    <span>₫35,000</span>
                  </li>

                  {discountCode && (
                    <li className="list-group-item d-flex justify-content-between px-0 text-success">
                      <span>Discount ({discountCode})</span>
                      <span>
                        -₫{(cart?.discountAmount || 0).toLocaleString()}
                      </span>
                    </li>
                  )}

                  {usingLoyaltyPoints && (
                    <li className="list-group-item d-flex justify-content-between px-0 text-success">
                      <span>Loyalty Points</span>
                      <span>
                        -₫{(cart?.loyaltyPointsValue || 0).toLocaleString()}
                      </span>
                    </li>
                  )}

                  <li className="list-group-item d-flex justify-content-between px-0 border-top">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold fs-5 text-danger">
                      ₫{cart?.total?.toLocaleString() || "0"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/cart")}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Return to Cart
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
