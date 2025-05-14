import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/order.service";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";

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
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "shipping":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="container mx-auto px-4 py-12">
        <Loader text="Loading order details..." />
      </div>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
        <div className="flex justify-center">
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
    <div className="container mx-auto px-4 py-12">
      {/* Success message for new orders */}
      {isNewOrder && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              Order placed successfully! An email with confirmation details has
              been sent to your email address.
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        {/* Order header */}
        <div className="border-b p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                  currentStatus?.status
                )}`}
              >
                {formatStatus(currentStatus?.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Order content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Order Items */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>

            <div className="border rounded-lg overflow-hidden">
              {order.items && order.items.length > 0 ? (
                <div className="divide-y">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center">
                      <div className="flex-shrink-0 w-20 h-20 border rounded-md overflow-hidden">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
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
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-gray-600">
                          {item.variantName}
                        </p>
                        <div className="flex mt-1">
                          <span className="text-sm text-gray-600">
                            ₫{formatPrice(item.price)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          ₫{formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No items found in this order.
                </div>
              )}
            </div>

            {/* Tracking Information */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tracking Information</h2>
                {!trackingData && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={fetchTracking}
                    disabled={trackingLoading}
                  >
                    {trackingLoading ? "Loading..." : "View Tracking"}
                  </Button>
                )}
              </div>

              {trackingData ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex justify-between">
                      <span className="font-medium">Status</span>
                      <span className="font-medium">Date</span>
                    </div>
                  </div>
                  <div className="divide-y">
                    {trackingData.statusHistory &&
                    trackingData.statusHistory.length > 0 ? (
                      trackingData.statusHistory.map((status, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 flex justify-between"
                        >
                          <div>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                                status.status
                              )}`}
                            >
                              {formatStatus(status.status)}
                            </span>
                            {status.note && (
                              <p className="text-sm text-gray-600 mt-1">
                                {status.note}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatDate(status.createdAt)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No tracking information available yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6 text-center text-gray-500 bg-gray-50">
                  <p>Click 'View Tracking' to see detailed status history.</p>
                </div>
              )}
            </div>

            {/* Cancel Order Form */}
            {canBeCancelled() && showCancelForm && (
              <div className="mt-8 border rounded-lg p-4 bg-red-50">
                <h2 className="text-lg font-semibold text-red-700 mb-3">
                  Cancel Order
                </h2>
                <p className="text-sm text-gray-700 mb-4">
                  Please provide a reason for cancelling this order. This action
                  cannot be undone.
                </p>

                <form onSubmit={handleCancelOrder}>
                  <div className="mb-4">
                    <label
                      htmlFor="cancellationReason"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reason for Cancellation
                    </label>
                    <textarea
                      id="cancellationReason"
                      rows="3"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Please provide a reason for cancellation"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={() => setShowCancelForm(false)}
                    >
                      Never Mind
                    </Button>
                    <Button
                      variant="danger"
                      type="submit"
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right column - Order Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="border rounded-lg overflow-hidden">
              {/* Price summary */}
              <div className="bg-gray-50 p-4 border-b">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₫{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>₫{formatPrice(order.shippingFee)}</span>
                  </div>

                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>₫{formatPrice(order.tax)}</span>
                    </div>
                  )}

                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount{" "}
                        {order.discountCode && `(${order.discountCode})`}
                      </span>
                      <span>-₫{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}

                  {order.loyaltyPointsUsed > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Loyalty Points ({order.loyaltyPointsUsed} points)
                      </span>
                      <span>
                        -₫{formatPrice(order.loyaltyPointsUsed * 1000)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t flex justify-between font-bold">
                    <span>Total</span>
                    <span>₫{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-4 border-b">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-sm">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.phoneNumber}
                  <br />
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && (
                    <span>
                      <br />
                      {order.shippingAddress.addressLine2}
                    </span>
                  )}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>

              {/* Payment Information */}
              <div className="p-4 border-b">
                <h3 className="font-medium mb-2">Payment Information</h3>
                <p className="text-sm">
                  <span className="block">
                    Status:{" "}
                    <span
                      className={
                        order.paymentStatus === "paid"
                          ? "text-green-600 font-medium"
                          : "text-yellow-600 font-medium"
                      }
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </span>
                  </span>
                  <span className="block mt-1">Method: Cash on Delivery</span>
                </p>
              </div>

              {/* Loyalty Points */}
              {order.loyaltyPointsEarned > 0 && (
                <div className="p-4">
                  <h3 className="font-medium mb-2">Loyalty Points</h3>
                  <p className="text-sm">
                    <span className="text-green-600 font-medium">
                      You earned {order.loyaltyPointsEarned} points
                    </span>
                    <span className="block text-gray-600 mt-1">
                      (Worth ₫{formatPrice(order.loyaltyPointsEarned * 1000)})
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {canBeCancelled() && !showCancelForm && (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setShowCancelForm(true)}
                >
                  Cancel Order
                </Button>
              )}

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/orders")}
              >
                Back to Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
