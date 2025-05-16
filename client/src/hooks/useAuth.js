import { useState, useEffect, useContext, createContext } from "react";
import authService from "../services/auth.service";

// Create an auth context
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps your app and provides auth state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check if we have a token
        if (token) {
          // Fetch user data with the token
          const response = await authService.getCurrentUser();

          if (response.success) {
            setUser(response.data);
          } else {
            // Token might be invalid or expired
            localStorage.removeItem("token");
            setToken(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        // Reset auth state on error
        localStorage.removeItem("token");
        setToken(null);
        setError("Authentication failed. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);

      if (response.success) {
        const { token: newToken, ...userData } = response.data;

        // Save token to localStorage and state
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);

        // Return success with role for redirection
        return {
          success: true,
          role: userData.role, // Add this line to return the role
        };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      return response;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    // Clear auth state
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);

    // Optional: You could also clear any other user-related data from localStorage
  };

  /**
   * Update user password
   */
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.updatePassword(
        currentPassword,
        newPassword
      );

      return response;
    } catch (err) {
      console.error("Password update error:", err);
      setError(err.message || "Failed to update password. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.forgotPassword(email);

      return response;
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.resetPassword(token, newPassword);

      return response;
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Create memoized auth context value to prevent unnecessary re-renders
  const contextValue = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    setToken, // Add this
    setUser, // Add this
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom hook to access the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
