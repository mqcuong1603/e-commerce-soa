import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Component to handle OAuth callback redirects from social logins
 * Extracts the token from URL and stores it in localStorage
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");

      if (token) {
        // Store the token
        localStorage.setItem("token", token);

        try {
          // Get user data from token
          const response = await fetch("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.data);
          }

          // Update auth context
          setToken(token);

          // Redirect to home or intended destination
          navigate("/", { replace: true });
        } catch (error) {
          console.error("Error in auth callback:", error);
          navigate("/login", {
            replace: true,
            state: {
              error: "Authentication failed. Please try again.",
            },
          });
        }
      } else {
        navigate("/login", {
          replace: true,
          state: {
            error: "No authentication token received",
          },
        });
      }
    };

    handleCallback();
  }, [navigate, searchParams, setToken, setUser]);

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Completing authentication, please wait...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
