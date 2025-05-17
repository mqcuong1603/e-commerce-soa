import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import orderService from "../../services/order.service";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import OrderHistory from "../../components/user/OrderHistory";

/**
 * Orders Page component
 * Displays the user's order history with pagination and filtering, using the OrderHistory component.
 */
const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/orders" } },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, render nothing or a loader until redirect happens
  if (!isAuthenticated) {
    return <Loader />;
  }

  return (
    <div className="container mt-5 mb-5">
      {/* Page Header */}
      <div
        className="card border-0 shadow-lg mb-5 rounded-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6f42c1 0%, #4a148c 100%)", // Vibrant purple gradient
        }}
      >
        <div className="card-body p-lg-5 p-4 text-white">
          <div className="row align-items-center">
            <div className="col-lg-8 col-md-7">
              <div className="d-flex align-items-center">
                <div
                  className="bg-white text-primary shadow-sm rounded-circle p-3 d-flex align-items-center justify-content-center me-sm-4 me-3 flex-shrink-0"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i
                    className="bi bi-receipt-cutoff"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>
                <div>
                  <h1 className="display-5 fw-bold mb-1">My Orders</h1>
                  <p className="lead mb-0 opacity-75 fs-6">
                    Track your purchases and manage your order history.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-5 text-md-end mt-4 mt-md-0">
              <Link
                to="/profile"
                className="btn btn-outline-light rounded-pill px-4 py-2"
              >
                <i className="bi bi-arrow-left-circle me-2"></i> Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order History Component */}
      {/* The OrderHistory component will handle fetching, displaying, filtering, and pagination of orders */}
      <OrderHistory />

      {/* Optional: Quick Links or Info Section */}
      <div className="mt-5 p-4 bg-light rounded-4 shadow-sm">
        <h5 className="fw-bold text-primary mb-3">
          <i className="bi bi-info-circle-fill me-2"></i>Need Help with an
          Order?
        </h5>
        <p className="text-muted">
          If you have any questions about your orders, please visit our{" "}
          <Link to="/contact" className="text-decoration-none fw-medium">
            Contact Page
          </Link>{" "}
          or check our{" "}
          <Link to="/faq" className="text-decoration-none fw-medium">
            FAQ section
          </Link>
          .
        </p>
        <Link to="/products" className="btn btn-primary rounded-pill mt-2">
          <i className="bi bi-cart-plus-fill me-2"></i>Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrdersPage;
