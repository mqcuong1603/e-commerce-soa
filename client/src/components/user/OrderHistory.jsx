import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Link, useNavigate } from "react-router-dom";
import orderService from "../../services/order.service";

/**
 * Component to display user's order history
 */
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const navigate = useNavigate();

  // Filters State
  const [filterStatus, setFilterStatus] = useState(""); // e.g., "pending", "delivered"
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Debounce timer for date filters
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Fetch orders from API - wrapped in useCallback to prevent re-creation on every render
  const fetchOrders = useCallback(
    async (page, limit, status, startDate, endDate) => {
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit };
        if (status) params.status = status;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await orderService.getUserOrders(params);

        if (response.success) {
          setOrders(response.data.orders || []);
          setPagination(
            response.data.pagination || {
              page: 1,
              limit: 5,
              total: 0,
              totalPages: 0,
            }
          );
        } else {
          throw new Error(response.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
        setOrders([]); // Clear orders on error
        setPagination({ page: 1, limit: 5, total: 0, totalPages: 0 }); // Reset pagination
      } finally {
        setLoading(false);
      }
    },
    []
  ); // Empty dependency array as it doesn't depend on props/state from this component directly

  // Effect for initial load and when filters/pagination change
  useEffect(() => {
    fetchOrders(
      pagination.page,
      pagination.limit,
      filterStatus,
      filterStartDate,
      filterEndDate
    );
  }, [
    pagination.page,
    pagination.limit,
    filterStatus,
    filterStartDate,
    filterEndDate,
    fetchOrders,
  ]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  // Handle date filter changes with debounce
  const handleDateChange = (e, dateType) => {
    const value = e.target.value;
    if (dateType === "start") {
      setFilterStartDate(value);
    } else {
      setFilterEndDate(value);
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    setDebounceTimeout(
      setTimeout(() => {
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
      }, 1000) // 1 second debounce
    );
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Format order status for display
  const formatStatus = (status) => {
    if (!status) return "";
    // Capitalize first letter and replace dashes with spaces
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit", // Changed to 2-digit for day
    }).format(date);
  };

  // Format price with comma for thousands and currency symbol
  const formatPrice = (price) => {
    return (
      price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
      "0 đ"
    );
  };

  // Get appropriate status badge color based on status (Bootstrap theme)
  const getStatusBadge = (status) => {
    let badgeClass = "badge fs-7 "; // Added fs-7 for slightly smaller badge text
    switch (status?.toLowerCase()) {
      case "pending":
        badgeClass += "bg-warning text-dark";
        break;
      case "confirmed":
        badgeClass += "bg-info text-dark";
        break;
      case "processing":
        badgeClass += "bg-primary";
        break;
      case "shipping":
        badgeClass += "bg-secondary";
        break;
      case "delivered":
        badgeClass += "bg-success";
        break;
      case "cancelled":
        badgeClass += "bg-danger";
        break;
      default:
        badgeClass += "bg-light text-dark";
    }
    return <span className={badgeClass}>{formatStatus(status)}</span>;
  };

  // Render loading state
  if (loading && orders.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const orderStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipping", label: "Shipping" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="order-history-container">
      {/* Filter Section */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="card-title fw-bold text-primary mb-3">
            <i className="bi bi-funnel-fill me-2"></i>Filter Orders
          </h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label
                htmlFor="statusFilter"
                className="form-label small fw-medium"
              >
                Status
              </label>
              <select
                id="statusFilter"
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={handleStatusChange}
              >
                {orderStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label
                htmlFor="startDateFilter"
                className="form-label small fw-medium"
              >
                From Date
              </label>
              <input
                type="date"
                id="startDateFilter"
                className="form-control form-control-sm"
                value={filterStartDate}
                onChange={(e) => handleDateChange(e, "start")}
                max={filterEndDate || new Date().toISOString().split("T")[0]} // Prevent start date after end date
              />
            </div>
            <div className="col-md-3">
              <label
                htmlFor="endDateFilter"
                className="form-label small fw-medium"
              >
                To Date
              </label>
              <input
                type="date"
                id="endDateFilter"
                className="form-control form-control-sm"
                value={filterEndDate}
                onChange={(e) => handleDateChange(e, "end")}
                min={filterStartDate} // Prevent end date before start date
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={clearFilters}
                title="Clear all filters"
              >
                <i className="bi bi-x-lg me-1"></i> Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Order list as cards */}
      {orders.length > 0 ? (
        <div className="row row-cols-1 g-4">
          {orders.map((order) => (
            <div key={order._id} className="col">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-lift">
                <div
                  className={`card-header bg-light border-bottom-0 p-3 d-flex justify-content-between align-items-center`}
                >
                  <h5 className="mb-0 fw-bold text-primary">
                    Order #{order.orderNumber}
                  </h5>
                  {getStatusBadge(
                    Array.isArray(order.status) && order.status.length > 0
                      ? order.status[0]?.status
                      : "pending"
                  )}
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <p className="mb-1 text-muted small">Order Date</p>
                      <p className="fw-medium mb-0">
                        <i className="bi bi-calendar-event me-2"></i>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted small">Order Total</p>
                      <p className="fw-bold fs-5 mb-0 text-success">
                        <i className="bi bi-credit-card me-2"></i>
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  <hr className="my-3" />

                  <p className="mb-1 text-muted small">Items</p>
                  <ul className="list-unstyled mb-3">
                    {order.items.slice(0, 2).map((item, index) => (
                      <li
                        key={item._id || index} // Use item._id if available, fallback to index
                        className="d-flex align-items-center mb-2 p-2 bg-light rounded-2"
                      >
                        {/* Image removed */}
                        <div className="flex-grow-1">
                          <p
                            className="fw-medium mb-0 text-truncate"
                            title={item.productName || "N/A"} // Use productName for title
                          >
                            {item.productName || "N/A"}{" "}
                            {/* Use productName for display */}
                          </p>
                          <p className="text-muted small mb-0">
                            Qty: {item.quantity} -{" "}
                            {formatPrice(item.totalPrice)}{" "}
                            {/* Use item.totalPrice */}
                          </p>
                        </div>
                      </li>
                    ))}
                    {order.items.length > 2 && (
                      <li className="text-muted small mt-1">
                        + {order.items.length - 2} more item(s)
                      </li>
                    )}
                  </ul>

                  <div className="d-flex justify-content-end">
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center shadow-sm"
                    >
                      <i className="bi bi-eye-fill me-2"></i>View Details
                    </Link>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="card-footer bg-light-subtle border-top-0 p-3">
                    <p className="mb-1 text-muted small">Shipping To</p>
                    <p className="mb-0 fw-medium small text-truncate">
                      <i className="bi bi-truck me-2"></i>
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-5 bg-light rounded-4 shadow-sm">
            <i className="bi bi-emoji-frown display-1 text-muted mb-3"></i>
            <h4 className="fw-bold text-secondary">No Orders Found</h4>
            <p className="text-muted mb-4">
              It looks like you haven't placed any orders yet.
            </p>
            <Link
              to="/products"
              className="btn btn-primary btn-lg rounded-pill px-5"
            >
              <i className="bi bi-cart-plus-fill me-2"></i>Start Shopping Now
            </Link>
          </div>
        )
      )}

      {/* Pagination - Bootstrap Styled */}
      {pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Order history pagination"
          className="mt-5 d-flex justify-content-center"
        >
          <ul className="pagination pagination-lg shadow-sm">
            <li
              className={`page-item ${
                !pagination.hasPrevPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <i className="bi bi-chevron-left"></i>
                <span className="visually-hidden">Previous</span>
              </button>
            </li>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              const isCurrentPage = pageNumber === pagination.page;
              if (
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                (pageNumber >= pagination.page - 2 &&
                  pageNumber <= pagination.page + 2) // Show more pages around current
              ) {
                return (
                  <li
                    key={pageNumber}
                    className={`page-item ${isCurrentPage ? "active" : ""}`}
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
                (pageNumber === 2 && pagination.page > 4) ||
                (pageNumber === pagination.totalPages - 1 &&
                  pagination.page < pagination.totalPages - 3)
              ) {
                return (
                  <li key={pageNumber} className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                );
              }
              return null;
            })}

            <li
              className={`page-item ${
                !pagination.hasNextPage ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                <i className="bi bi-chevron-right"></i>
                <span className="visually-hidden">Next</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default OrderHistory;
