import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import cartService from "../services/cart.service";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

// Create a context
const CartContext = createContext(null);

// Define initial cart state
const initialCartState = {
  items: [],
  total: 0,
  subtotal: 0,
  itemCount: 0,
  userLoyaltyPoints: 0,
  loading: false,
  error: null,
};

// Create provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialCartState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestFailed, setRequestFailed] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Add these to prevent request flooding
  const requestTimeoutRef = useRef(null);
  const fetchInProgressRef = useRef(false);
  const lastSuccessfulFetchRef = useRef(0);
  const requestIdRef = useRef(0);

  // Load cart on initial mount and when auth state changes
  useEffect(() => {
    fetchCart(true);

    // Clean up on unmount
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, [isAuthenticated]); // Re-fetch when auth state changes

  const fetchCart = useCallback(async (force = false) => {
    // Prevent multiple simultaneous requests
    if (fetchInProgressRef.current) {
      console.log("Cart fetch already in progress, skipping duplicate request");
      return { success: false, error: "Request already in progress" };
    }

    // Prevent excessive rapid fetches
    const now = Date.now();
    const timeSinceLastFetch = now - lastSuccessfulFetchRef.current;
    if (
      !force &&
      timeSinceLastFetch < 1000 &&
      lastSuccessfulFetchRef.current !== 0
    ) {
      console.log(
        `Skipping fetch, last successful fetch was ${timeSinceLastFetch}ms ago`
      );
      return { success: true, cached: true };
    }

    // Generate a unique request ID
    const currentRequestId = ++requestIdRef.current;

    try {
      fetchInProgressRef.current = true;
      setLoading(true);

      const response = await cartService.getCart();

      // If another request has started since this one, discard this result
      if (currentRequestId !== requestIdRef.current) {
        console.log("Discarding outdated fetch cart response");
        return { success: false, error: "Superseded by newer request" };
      }

      if (response.success) {
        setCart({
          items: response.data.items || [],
          total: response.data.total || 0,
          subtotal: response.data.subtotal || 0,
          itemCount: response.data.itemCount || 0,
          userLoyaltyPoints: response.data.userId
            ? response.data.user?.loyaltyPoints || 0
            : 0,
          loading: false,
          error: null,
        });

        // Reset error state on successful request
        setError(null);
        setRequestFailed(false);
        // Track successful fetch time
        lastSuccessfulFetchRef.current = now;
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;

      setError(err.message || "Error fetching cart");
      console.error("Error fetching cart:", err);

      // Handle failed requests with exponential backoff
      if (!requestFailed) {
        setRequestFailed(true);

        // Only set up a retry if one isn't already scheduled
        if (!requestTimeoutRef.current) {
          requestTimeoutRef.current = setTimeout(() => {
            requestTimeoutRef.current = null;
            // Try again once after 3 seconds
            fetchCart(true);
          }, 3000);
        }
      }
      return { success: false, error: err.message };
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    }
  }, []);

  const removeFromCart = useCallback(
    async (productVariantId) => {
      if (loading || fetchInProgressRef.current) {
        return { success: false, error: "Request in progress" };
      }

      const currentRequestId = ++requestIdRef.current;
      try {
        fetchInProgressRef.current = true;
        setLoading(true);
        const response = await cartService.removeItem(productVariantId);

        // If another request has started, discard this result
        if (currentRequestId !== requestIdRef.current) {
          return { success: false, error: "Superseded by newer request" };
        }

        if (response.success) {
          setCart({
            items: response.data.items || [],
            total: response.data.total || 0,
            subtotal: response.data.subtotal || 0,
            itemCount: response.data.itemCount || 0,
            userLoyaltyPoints: response.data.userId
              ? response.data.user?.loyaltyPoints || 0
              : 0,
            loading: false,
            error: null,
          });

          lastSuccessfulFetchRef.current = Date.now();

          // Show success toast
          toast.success("Item removed from cart", {
            position: "bottom-right",
            autoClose: 2000,
          });

          return { success: true };
        } else {
          throw new Error(
            response.message || "Failed to remove item from cart"
          );
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;

        setError(err.message || "Error removing item from cart");
        console.error("Error removing from cart:", err);

        // Show error toast
        toast.error(err.message || "Error removing item from cart", {
          position: "bottom-right",
        });

        return { success: false, error: err.message };
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }
    },
    [loading]
  );

  const clearCart = useCallback(async () => {
    if (loading || fetchInProgressRef.current) {
      return { success: false, error: "Request in progress" };
    }

    const currentRequestId = ++requestIdRef.current;
    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      const response = await cartService.clearCart();

      // If another request has started, discard this result
      if (currentRequestId !== requestIdRef.current) {
        return { success: false, error: "Superseded by newer request" };
      }

      if (response.success) {
        setCart({
          items: [],
          total: 0,
          subtotal: 0,
          itemCount: 0,
          userLoyaltyPoints: isAuthenticated ? user?.loyaltyPoints || 0 : 0,
          loading: false,
          error: null,
        });

        lastSuccessfulFetchRef.current = Date.now();

        // Show success toast
        toast.success("Cart cleared successfully", {
          position: "bottom-right",
          autoClose: 2000,
        });

        return { success: true };
      } else {
        throw new Error(response.message || "Failed to clear cart");
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;

      setError(err.message || "Error clearing cart");
      console.error("Error clearing cart:", err);

      // Show error toast
      toast.error(err.message || "Error clearing cart", {
        position: "bottom-right",
      });

      return { success: false, error: err.message };
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    }
  }, [loading, isAuthenticated, user]);

  const addToCart = useCallback(
    async (productVariantId, quantity = 1) => {
      if (loading || fetchInProgressRef.current) {
        return { success: false, error: "Request in progress" };
      }

      const currentRequestId = ++requestIdRef.current;
      try {
        fetchInProgressRef.current = true;
        setLoading(true);

        // Simplified - no manual sessionId handling
        const response = await cartService.addItem(productVariantId, quantity);

        // If another request has started, discard this result
        if (currentRequestId !== requestIdRef.current) {
          return { success: false, error: "Superseded by newer request" };
        }

        if (response.success) {
          // Update local state with cart data
          setCart({
            items: response.data.items || [],
            total: response.data.total || 0,
            subtotal: response.data.subtotal || 0,
            itemCount: response.data.itemCount || 0,
            userLoyaltyPoints: response.data.userId
              ? response.data.user?.loyaltyPoints || 0
              : 0,
            loading: false,
            error: null,
          });

          lastSuccessfulFetchRef.current = Date.now();

          // Show success toast
          toast.success("Item added to cart", {
            position: "bottom-right",
            autoClose: 2000,
          });

          return { success: true };
        } else {
          throw new Error(response.message || "Failed to add item to cart");
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;

        // Handle specific inventory errors
        if (err.isInventoryError) {
          toast.error(err.message || "Not enough inventory available", {
            position: "bottom-right",
          });
        } else {
          toast.error(err.message || "Error adding item to cart", {
            position: "bottom-right",
          });
        }

        setError(err.message || "Error adding item to cart");
        console.error("Error adding to cart:", err);
        return { success: false, error: err.message };
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }
    },
    [loading]
  );

  const updateCartItem = useCallback(
    async (productVariantId, quantity) => {
      if (loading || fetchInProgressRef.current) {
        return { success: false, error: "Request in progress" };
      }

      const currentRequestId = ++requestIdRef.current;
      try {
        fetchInProgressRef.current = true;
        setLoading(true);
        const response = await cartService.updateItem(
          productVariantId,
          quantity
        );

        // If another request has started, discard this result
        if (currentRequestId !== requestIdRef.current) {
          return { success: false, error: "Superseded by newer request" };
        }

        if (response.success) {
          setCart({
            items: response.data.items || [],
            total: response.data.total || 0,
            subtotal: response.data.subtotal || 0,
            itemCount: response.data.itemCount || 0,
            userLoyaltyPoints: response.data.userId
              ? response.data.user?.loyaltyPoints || 0
              : 0,
            loading: false,
            error: null,
          });

          lastSuccessfulFetchRef.current = Date.now();
          return { success: true };
        } else {
          throw new Error(response.message || "Failed to update cart item");
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;

        // Handle specific inventory errors
        if (err.isInventoryError) {
          toast.error(err.message || "Not enough inventory available", {
            position: "bottom-right",
          });
        } else {
          toast.error(err.message || "Error updating cart", {
            position: "bottom-right",
          });
        }

        setError(err.message || "Error updating cart item");
        console.error("Error updating cart item:", err);
        return { success: false, error: err.message };
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }
    },
    [loading]
  );

  // Apply discount code to cart
  const applyDiscount = useCallback(
    async (code) => {
      if (loading || fetchInProgressRef.current) {
        return { success: false, error: "Request in progress" };
      }

      const currentRequestId = ++requestIdRef.current;
      try {
        fetchInProgressRef.current = true;
        setLoading(true);

        const response = await cartService.verifyDiscount(code);

        // If another request has started, discard this result
        if (currentRequestId !== requestIdRef.current) {
          return { success: false, error: "Superseded by newer request" };
        }

        if (response.success) {
          // Only update relevant discount info, not the whole cart
          return {
            success: true,
            data: response.data,
            message: "Discount code applied successfully",
          };
        } else {
          throw new Error(response.message || "Invalid discount code");
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;

        setError(err.message || "Error applying discount code");
        console.error("Error applying discount:", err);
        return {
          success: false,
          error: err.message || "Invalid discount code",
        };
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }
    },
    [loading]
  );

  // Apply loyalty points to cart
  const applyLoyaltyPoints = useCallback(
    async (points) => {
      if (!isAuthenticated) {
        return {
          success: false,
          error: "You must be logged in to use loyalty points",
        };
      }

      if (loading || fetchInProgressRef.current) {
        return { success: false, error: "Request in progress" };
      }

      const currentRequestId = ++requestIdRef.current;
      try {
        fetchInProgressRef.current = true;
        setLoading(true);

        const response = await cartService.applyLoyaltyPoints(points);

        // If another request has started, discard this result
        if (currentRequestId !== requestIdRef.current) {
          return { success: false, error: "Superseded by newer request" };
        }

        if (response.success) {
          return {
            success: true,
            data: response.data,
            message: "Loyalty points applied successfully",
          };
        } else {
          throw new Error(response.message || "Failed to apply loyalty points");
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;

        setError(err.message || "Error applying loyalty points");
        console.error("Error applying loyalty points:", err);
        return {
          success: false,
          error: err.message || "Error applying loyalty points",
        };
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }
    },
    [loading, isAuthenticated]
  );

  // The context value that will be provided
  const value = {
    cart: {
      ...cart,
      loading,
      error,
      isEmpty: !cart.items || cart.items.length === 0,
    },
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    applyDiscount,
    applyLoyaltyPoints,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
