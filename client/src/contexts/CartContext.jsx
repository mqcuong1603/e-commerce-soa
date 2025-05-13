import React, { createContext, useContext, useState, useEffect } from "react";
import cartService from "../services/cart.service";

// Create a context
const CartContext = createContext(null);

// Define initial cart state
const initialCartState = {
  items: [],
  total: 0,
  subtotal: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

// Create provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialCartState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart on initial mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();

      if (response.success) {
        setCart({
          items: response.data.items || [],
          total: response.data.total || 0,
          subtotal: response.data.subtotal || 0,
          itemCount: response.data.itemCount || 0,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (err) {
      setError(err.message || "Error fetching cart");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productVariantId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await cartService.addItem(productVariantId, quantity);

      if (response.success) {
        setCart({
          items: response.data.items || [],
          total: response.data.total || 0,
          subtotal: response.data.subtotal || 0,
          itemCount: response.data.itemCount || 0,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to add item to cart");
      }
    } catch (err) {
      setError(err.message || "Error adding item to cart");
      console.error("Error adding to cart:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productVariantId, quantity) => {
    try {
      setLoading(true);
      const response = await cartService.updateItem(productVariantId, quantity);

      if (response.success) {
        setCart({
          items: response.data.items || [],
          total: response.data.total || 0,
          subtotal: response.data.subtotal || 0,
          itemCount: response.data.itemCount || 0,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to update cart item");
      }
    } catch (err) {
      setError(err.message || "Error updating cart item");
      console.error("Error updating cart item:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productVariantId) => {
    try {
      setLoading(true);
      const response = await cartService.removeItem(productVariantId);

      if (response.success) {
        setCart({
          items: response.data.items || [],
          total: response.data.total || 0,
          subtotal: response.data.subtotal || 0,
          itemCount: response.data.itemCount || 0,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to remove item from cart");
      }
    } catch (err) {
      setError(err.message || "Error removing item from cart");
      console.error("Error removing from cart:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.clearCart();

      if (response.success) {
        setCart({
          items: [],
          total: 0,
          subtotal: 0,
          itemCount: 0,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to clear cart");
      }
    } catch (err) {
      setError(err.message || "Error clearing cart");
      console.error("Error clearing cart:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // The context value that will be provided
  const value = {
    cart: {
      ...cart,
      loading,
      error,
    },
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
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

export default CartContext;
