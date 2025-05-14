import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import CheckoutForm from "../components/checkout/CheckoutForm";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

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
      <div className="container mx-auto px-4 py-12">
        <Loader text="Preparing checkout..." />
      </div>
    );
  }

  // Error state
  if (error || cartError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-8">Checkout</h1>

          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error || cartError}</p>
          </div>

          <div className="flex justify-center">
            <Button variant="primary" onClick={() => navigate("/cart")}>
              Return to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main checkout form */}
        <div className="w-full lg:w-2/3">
          <CheckoutForm
            discountCode={discountCode}
            usingLoyaltyPoints={usingLoyaltyPoints}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            {/* Cart items summary */}
            <div className="max-h-80 overflow-y-auto mb-4">
              <div className="divide-y">
                {cart?.items?.map((item) => (
                  <div
                    key={item.productVariantId._id}
                    className="py-3 flex items-center"
                  >
                    <div className="flex-shrink-0 w-16 h-16 border rounded-md overflow-hidden">
                      {item.productVariantId.images &&
                      item.productVariantId.images.length > 0 ? (
                        <img
                          src={item.productVariantId.images[0].imageUrl}
                          alt={
                            item.productVariantId.productId?.name || "Product"
                          }
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
                      <div className="font-medium text-sm">
                        {item.productVariantId.productId?.name || "Product"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.productVariantId?.name || "Variant"}
                      </div>
                      <div className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ₫{item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price details */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₫{cart?.subtotal?.toLocaleString() || "0"}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>₫35,000</span>
              </div>

              {discountCode && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discountCode})</span>
                  <span>-₫{(cart?.discountAmount || 0).toLocaleString()}</span>
                </div>
              )}

              {usingLoyaltyPoints && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Loyalty Points</span>
                  <span>
                    -₫{(cart?.loyaltyPointsValue || 0).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>₫{cart?.total?.toLocaleString() || "0"}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/cart")}
              >
                Return to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
