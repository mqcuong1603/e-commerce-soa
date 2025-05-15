import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import orderService from "../../services/order.service";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Card from "../../components/ui/Card";

/**
 * Orders Page component
 * Displays the user's order history with pagination
 */
const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/orders" } },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders when component mounts or pagination changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(pagination.page, pagination.limit);
    }
  }, [isAuthenticated, pagination.page, pagination.limit]);

  // Fetch orders from API
  const fetchOrders = async (page, limit) => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getUserOrders({
        page,
        limit,
      });

      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
      // Scroll to top
      window.scrollTo(0, 0);
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
      month: "short",
      day: "numeric",
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

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <Loader text="Loading your orders..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bold mb-4 text-primary">My Orders</h1>

      {/* Error message */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center mb-4"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 ? (
        <div className="mb-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card shadow-sm mb-4 border-0 hover-shadow"
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h5 className="card-title fw-bold mb-1">
                      Order #{order.orderNumber}
                    </h5>
                    <p className="card-text text-muted small">
                      <i className="bi bi-calendar3 me-1"></i>
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="col-md-6 text-md-end mt-3 mt-md-0">
                    <span
                      className={`badge ${getStatusBadgeClass(
                        order.status[0]?.status
                      )} py-2 px-3 me-3`}
                    >
                      <i className="bi bi-circle-fill me-1 small"></i>
                      {formatStatus(order.status[0]?.status)}
                    </span>
                    <span className="fw-bold fs-5 text-danger">
                      ₫{formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                {/* Order items preview */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex flex-wrap gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item._id}
                        className="border rounded p-1 bg-white"
                        style={{ width: "60px", height: "60px" }}
                      >
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="img-fluid object-fit-contain h-100 w-100"
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                            <span className="text-muted small">No image</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {order.items.length > 4 && (
                      <div
                        className="border rounded d-flex align-items-center justify-content-center bg-light"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <span className="text-muted small fw-medium">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order actions */}
              <div className="card-footer bg-light border-top px-4 py-3 d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  <i className="bi bi-box me-1"></i>
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order._id}`);
                  }}
                >
                  <i className="bi bi-eye me-1"></i> View Details
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Order pagination">
                <ul className="pagination">
                  {/* Previous page button */}
                  <li
                    className={`page-item ${
                      pagination.page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      aria-label="Previous"
                      disabled={pagination.page === 1}
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </button>
                  </li>

                  {/* Page numbers */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show current page, first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.page - 1 &&
                        pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            pageNumber === pagination.page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    } else if (
                      (pageNumber === 2 && pagination.page > 3) ||
                      (pageNumber === pagination.totalPages - 1 &&
                        pagination.page < pagination.totalPages - 2)
                    ) {
                      // Show ellipsis
                      return (
                        <li key={pageNumber} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}

                  {/* Next page button */}
                  <li
                    className={`page-item ${
                      pagination.page === pagination.totalPages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      aria-label="Next"
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="card border-0 shadow-sm py-5">
          <div className="card-body text-center p-5">
            <div className="mb-4">
              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-receipt text-secondary"
                  style={{ fontSize: "2rem" }}
                ></i>
              </div>
              <h2 className="fw-bold text-primary mb-3">No Orders Yet</h2>
              <p className="text-muted mb-4 px-md-5 mx-md-5">
                You haven't placed any orders yet. Start shopping to place your
                first order!
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/products")}
              >
                <i className="bi bi-cart-plus me-2"></i>
                Browse Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
