import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";

/**
 * Cart page component
 * Displays items in the user's cart and provides a summary with checkout option
 */
const CartPage = () => {
  const { cart, clearCart, loading, error, refreshCart } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [discountSuccess, setDiscountSuccess] = useState("");
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
    setDiscountError("");
    setDiscountSuccess("");

    try {
      const { success, data, error, message } = await cart.applyDiscount(code);

      if (success && data) {
        setDiscountCode(code);
        setDiscountAmount(data.discountAmount || 0);
        setDiscountSuccess(message || "Discount code applied successfully!");
        return { success: true };
      } else {
        setDiscountError(error || message || "Invalid discount code");
        return {
          success: false,
          message: error || message || "Invalid discount code",
        };
      }
    } catch (err) {
      const errorMsg = "Error applying discount code";
      setDiscountError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Handle clearing the cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Loading state
  if (loading && !cart.items) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loader text="Loading your cart..." />
      </div>
    );
  }

  // Empty cart state
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-8">Your Cart</h1>

          <div className="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/products">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Cart Items ({cart.itemCount})
              </h2>
              {cart.items && cart.items.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              )}
            </div>

            <div className="divide-y">
              {cart.items &&
                cart.items.map((item) => (
                  <CartItem key={item.productVariantId._id} item={item} />
                ))}
            </div>

            <div className="mt-6">
              <Link to="/products">
                <Button variant="outlined">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Cart summary */}
        <div className="w-full lg:w-1/3">
          <CartSummary
            onApplyDiscount={handleApplyDiscount}
            discountCode={discountCode}
            discountAmount={discountAmount}
            loyaltyPoints={loyaltyPoints}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
