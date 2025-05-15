import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import orderService from "../../services/order.service";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

/**
 * Order Detail Page component
 * Displays detailed information about a specific order
 */
const OrderDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Check if this is a newly created order from checkout
  const isNewOrder = location.state?.isNewOrder || false;

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: `/orders/${id}` } },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch order details when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, id]);

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getOrderDetails(id);

      if (response.success) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order tracking information
  const fetchTracking = async () => {
    try {
      setTrackingLoading(true);
      setError(null);

      const response = await orderService.getOrderTracking(id);

      if (response.success) {
        setTrackingData(response.data);
      } else {
        throw new Error(
          response.message || "Failed to fetch tracking information"
        );
      }
    } catch (err) {
      console.error("Error fetching tracking:", err);
      setError("Failed to load tracking information. Please try again.");
    } finally {
      setTrackingLoading(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (e) => {
    if (e) e.preventDefault();

    if (!cancellationReason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    try {
      setCancelling(true);
      setError(null);

      const response = await orderService.cancelOrder(id, {
        reason: cancellationReason,
      });

      if (response.success) {
        setShowCancelForm(false);
        // Refresh order details to show updated status
        fetchOrderDetails();
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError("Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge color based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "confirmed":
        return "bg-primary text-white";
      case "processing":
        return "bg-info text-dark";
      case "shipping":
        return "bg-secondary text-white";
      case "delivered":
        return "bg-success text-white";
      case "cancelled":
        return "bg-danger text-white";
      default:
        return "bg-light text-dark";
    }
  };

  // Format order status for display
  const formatStatus = (status) => {
    if (!status) return "";
    // Capitalize first letter and replace dashes with spaces
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");
  };

  // Check if order can be cancelled
  const canBeCancelled = () => {
    if (!order || !order.status || order.status.length === 0) return false;

    // Only allow cancellation for pending or confirmed status
    const cancellableStatuses = ["pending", "confirmed"];
    return cancellableStatuses.includes(order.status[0].status);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-5">
        <Loader text="Loading order details..." />
      </div>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <p>{error}</p>
        </div>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Get current status
  const currentStatus =
    order.status && order.status.length > 0 ? order.status[0] : null;

  return (
    <div className="container py-5">
      {/* Success message for new orders */}
      {isNewOrder && (
        <div
          className="alert alert-success d-flex align-items-center mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          <div>
            Order placed successfully! An email with confirmation details has
            been sent to your email address.
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <p className="mb-0">{error}</p>
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        {/* Order header */}
        <div className="card-header bg-white border-bottom p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="h3 fw-bold mb-1">Order #{order.orderNumber}</h1>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar3 me-1"></i>
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <span
                className={`badge ${getStatusBadgeClass(
                  currentStatus?.status
                )} p-2`}
              >
                <i className="bi bi-circle-fill me-1 small"></i>
                {formatStatus(currentStatus?.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Order content */}
        <div className="card-body p-4">
          <div className="row g-4">
            {/* Left column - Order Items */}
            <div className="col-lg-8">
              <h2 className="h4 fw-bold mb-4">Order Items</h2>

              <div className="card mb-5">
                <ul className="list-group list-group-flush">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <li key={index} className="list-group-item p-3">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <div
                              className="border rounded p-2"
                              style={{ width: "80px", height: "80px" }}
                            >
                              {item.productImageUrl ? (
                                <img
                                  src={item.productImageUrl}
                                  alt={item.productName}
                                  className="img-fluid h-100 w-100 object-fit-contain"
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                  <span className="text-muted small">
                                    No image
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ms-3 flex-grow-1">
                            <h5 className="fs-6 fw-semibold mb-1">
                              {item.productName}
                            </h5>
                            <p className="text-muted small mb-1">
                              {item.variantName}
                            </p>
                            <span className="text-muted small">
                              ₫{formatPrice(item.price)} × {item.quantity}
                            </span>
                          </div>
                          <div className="text-end ms-2">
                            <span className="fw-bold">
                              ₫{formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item py-5 text-center text-muted">
                      No items found in this order.
                    </li>
                  )}
                </ul>
              </div>

              {/* Tracking Information */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 fw-bold mb-0">Tracking Information</h2>
                  {!trackingData && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={fetchTracking}
                      disabled={trackingLoading}
                    >
                      {trackingLoading ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Loading...
                        </span>
                      ) : (
                        <span>
                          <i className="bi bi-truck me-2"></i>
                          View Tracking
                        </span>
                      )}
                    </Button>
                  )}
                </div>

                {trackingData ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light py-3">
                      <div className="row">
                        <div className="col-6">
                          <span className="fw-medium">Status</span>
                        </div>
                        <div className="col-6 text-end">
                          <span className="fw-medium">Date</span>
                        </div>
                      </div>
                    </div>
                    <ul className="list-group list-group-flush">
                      {trackingData.statusHistory &&
                      trackingData.statusHistory.length > 0 ? (
                        trackingData.statusHistory.map((status, index) => (
                          <li key={index} className="list-group-item py-3">
                            <div className="row">
                              <div className="col-md-6">
                                <span
                                  className={`badge ${getStatusBadgeClass(
                                    status.status
                                  )} me-2`}
                                >
                                  {formatStatus(status.status)}
                                </span>
                                {status.note && (
                                  <p className="small text-muted mt-2 mb-0">
                                    {status.note}
                                  </p>
                                )}
                              </div>
                              <div className="col-md-6 text-md-end">
                                <span className="small text-muted">
                                  {formatDate(status.createdAt)}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item py-4 text-center text-muted">
                          No tracking information available yet.
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="card bg-light border-0">
                    <div className="card-body p-4 text-center text-muted">
                      <i className="bi bi-box-seam fs-3 mb-3 d-block"></i>
                      <p className="mb-0">
                        Click 'View Tracking' to see detailed status history.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancel Order Form */}
              {canBeCancelled() && showCancelForm && (
                <div className="card bg-danger bg-opacity-10 border-danger border-opacity-25 mt-4">
                  <div className="card-body p-4">
                    <h2 className="h5 fw-bold text-danger mb-3">
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel Order
                    </h2>
                    <p className="text-muted small mb-4">
                      Please provide a reason for cancelling this order. This
                      action cannot be undone.
                    </p>

                    <form onSubmit={handleCancelOrder}>
                      <div className="mb-4">
                        <label
                          htmlFor="cancellationReason"
                          className="form-label"
                        >
                          Reason for Cancellation
                        </label>
                        <textarea
                          id="cancellationReason"
                          rows="3"
                          value={cancellationReason}
                          onChange={(e) =>
                            setCancellationReason(e.target.value)
                          }
                          className="form-control"
                          placeholder="Please provide a reason for cancellation"
                        />
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowCancelForm(false)}
                        >
                          Never Mind
                        </button>
                        <button
                          type="submit"
                          className="btn btn-danger"
                          disabled={cancelling}
                        >
                          {cancelling ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Cancelling...
                            </>
                          ) : (
                            "Confirm Cancellation"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Order Summary */}
            <div className="col-lg-4">
              <h2 className="h4 fw-bold mb-4">Order Summary</h2>

              <div className="card shadow-sm border-0 mb-4">
                {/* Price summary */}
                <div className="card-body bg-light p-4">
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span>₫{formatPrice(order.subtotal)}</span>
                    </li>
                    <li className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Shipping</span>
                      <span>₫{formatPrice(order.shippingFee)}</span>
                    </li>

                    {order.tax > 0 && (
                      <li className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax</span>
                        <span>₫{formatPrice(order.tax)}</span>
                      </li>
                    )}

                    {order.discountAmount > 0 && (
                      <li className="d-flex justify-content-between mb-2 text-success">
                        <span>
                          Discount{" "}
                          {order.discountCode && `(${order.discountCode})`}
                        </span>
                        <span>-₫{formatPrice(order.discountAmount)}</span>
                      </li>
                    )}

                    {order.loyaltyPointsUsed > 0 && (
                      <li className="d-flex justify-content-between mb-2 text-success">
                        <span>
                          Loyalty Points ({order.loyaltyPointsUsed} points)
                        </span>
                        <span>
                          -₫{formatPrice(order.loyaltyPointsUsed * 1000)}
                        </span>
                      </li>
                    )}

                    <li className="d-flex justify-content-between fw-bold pt-2 mt-2 border-top">
                      <span>Total</span>
                      <span>₫{formatPrice(order.total)}</span>
                    </li>
                  </ul>
                </div>

                {/* Shipping Address */}
                <div className="card-body border-top p-4">
                  <h3 className="h6 fw-bold mb-3">
                    <i className="bi bi-geo-alt me-2"></i>
                    Shipping Address
                  </h3>
                  <address className="mb-0">
                    <strong>{order.shippingAddress.fullName}</strong>
                    <br />
                    {order.shippingAddress.phoneNumber}
                    <br />
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && (
                      <>
                        <br />
                        {order.shippingAddress.addressLine2}
                      </>
                    )}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </address>
                </div>

                {/* Payment Information */}
                <div className="card-body border-top p-4">
                  <h3 className="h6 fw-bold mb-3">
                    <i className="bi bi-credit-card me-2"></i>
                    Payment Information
                  </h3>
                  <p className="mb-0">
                    <span className="d-block">
                      Status:{" "}
                      <span
                        className={
                          order.paymentStatus === "paid"
                            ? "text-success fw-medium"
                            : "text-warning fw-medium"
                        }
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </span>
                    </span>
                    <span className="d-block mt-1">
                      Method: Cash on Delivery
                    </span>
                  </p>
                </div>

                {/* Loyalty Points */}
                {order.loyaltyPointsEarned > 0 && (
                  <div className="card-body border-top p-4">
                    <h3 className="h6 fw-bold mb-3">
                      <i className="bi bi-star me-2"></i>
                      Loyalty Points
                    </h3>
                    <p className="mb-0">
                      <span className="text-success fw-medium">
                        <i className="bi bi-plus-circle me-1"></i>
                        You earned {order.loyaltyPointsEarned} points
                      </span>
                      <span className="d-block text-muted small mt-1">
                        (Worth ₫{formatPrice(order.loyaltyPointsEarned * 1000)})
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                {canBeCancelled() && !showCancelForm && (
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowCancelForm(true)}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel Order
                  </button>
                )}

                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/orders")}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
