import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import cartService from "../services/cart.service";

// Create a cart context
const CartContext = createContext(null);

/**
 * CartProvider component that wraps your app and provides cart state
 */
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartUpdating, setCartUpdating] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  /**
   * Fetch current cart from API
   */
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await cartService.getCart();

      if (response.success) {
        setCart(response.data);
        setSessionInitialized(true);
        console.log("Cart fetched successfully:", response.data.sessionId);
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("Failed to load your cart. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize cart on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Add item to cart
   */
  const addItem = async (productVariantId, quantity = 1) => {
    try {
      setCartUpdating(true);
      setError(null);

      const response = await cartService.addItem(productVariantId, quantity);

      if (response.success) {
        setCart(response.data);
        return { success: true, message: "Item added to cart" };
      } else {
        throw new Error(response.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(err.message || "Failed to add item to cart. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setCartUpdating(false);
    }
  };

  /**
   * Update cart item quantity
   */
  const updateItem = async (productVariantId, quantity) => {
    try {
      setCartUpdating(true);
      setError(null);

      const response = await cartService.updateItem(productVariantId, quantity);

      if (response.success) {
        setCart(response.data);
        return { success: true, message: "Cart updated" };
      } else {
        throw new Error(response.message || "Failed to update cart");
      }
    } catch (err) {
      console.error("Update cart error:", err);
      setError(err.message || "Failed to update cart. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setCartUpdating(false);
    }
  };

  /**
   * Remove item from cart
   */
  const removeItem = async (productVariantId) => {
    try {
      setCartUpdating(true);
      setError(null);

      const response = await cartService.removeItem(productVariantId);

      if (response.success) {
        setCart(response.data);
        return { success: true, message: "Item removed from cart" };
      } else {
        throw new Error(response.message || "Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Remove from cart error:", err);
      setError(err.message || "Failed to remove item. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setCartUpdating(false);
    }
  };

  /**
   * Clear cart (remove all items)
   */
  const clearCart = async () => {
    try {
      setCartUpdating(true);
      setError(null);

      const response = await cartService.clearCart();

      if (response.success) {
        setCart(response.data);
        return { success: true, message: "Cart cleared" };
      } else {
        throw new Error(response.message || "Failed to clear cart");
      }
    } catch (err) {
      console.error("Clear cart error:", err);
      setError(err.message || "Failed to clear cart. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setCartUpdating(false);
    }
  };

  /**
   * Apply discount code to cart
   */
  const applyDiscount = async (code) => {
    try {
      setCartUpdating(true);
      setError(null);

      const response = await cartService.verifyDiscount(code);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: "Discount code applied",
        };
      } else {
        throw new Error(response.message || "Invalid discount code");
      }
    } catch (err) {
      console.error("Apply discount error:", err);
      setError(err.message || "Failed to apply discount. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setCartUpdating(false);
    }
  };

  /**
   * Apply loyalty points to cart
   */
  const applyLoyaltyPoints = async (points) => {
    try {
      setCartUpdating(true);
      setError(null);

      const response = await cartService.applyLoyaltyPoints(points);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: "Loyalty points applied",
        };
      } else {
        throw new Error(response.message || "Failed to apply loyalty points");
      }
    } catch (err) {
      console.error("Apply loyalty points error:", err);
      setError(err.message || "Failed to apply points. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setCartUpdating(false);
    }
  };

  // Computed values
  const itemCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const subtotal = cart?.total || 0;
  const isEmpty = !cart?.items?.length;

  // Create memoized context value to prevent unnecessary re-renders
  const contextValue = {
    cart,
    loading,
    error,
    cartUpdating,
    itemCount,
    subtotal,
    isEmpty,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyDiscount,
    applyLoyaltyPoints,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

/**
 * Custom hook to access the cart context
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

export default useCart;
