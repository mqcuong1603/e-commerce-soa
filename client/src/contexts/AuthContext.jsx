import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";

// Create context
const AuthContext = createContext(null);

// Create provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get user data from local storage
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token and get user profile
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        localStorage.removeItem("token");
        setError("Authentication failed. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);

      if (response.success) {
        // Store token
        localStorage.setItem("token", response.data.token);

        // Set user data
        setUser(response.data);
        setIsAuthenticated(true);

        // No need to manually merge carts - the server handles this via cartMiddleware

        return { success: true };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.forgotPassword(email);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Failed to send reset email");
      }
    } catch (err) {
      setError(
        err.message || "Failed to request password reset. Please try again."
      );
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.resetPassword(token, newPassword);

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.updatePassword(
        currentPassword,
        newPassword
      );

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (err) {
      setError(err.message || "Failed to update password. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided by the context
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
