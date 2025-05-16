import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import adminService from "../../services/admin.service"; // Change this import
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/ui/Loader";
import { Card, Form, Button, Badge, Row, Col } from "react-bootstrap";

const AdminOrdersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    status: "",
    period: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/admin/orders" } } });
    } else if (user && user.role !== "admin") {
      navigate("/");
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, user, navigate, pagination.page]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query params object instead of string
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.period) {
        params.period = filters.period;
      }

      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      // Use adminService instead of direct API call
      const response = await adminService.getOrders(params);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      period: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Get status badge class based on status
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
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Orders Management</h1>
        </div>

        {/* Filters */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Filters</h5>
            <Row className="g-3">
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipping">Shipping</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Time Period</Form.Label>
                  <Form.Select
                    name="period"
                    value={filters.period}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {filters.period === "custom" && (
                <>
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col xs={12}>
                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Loader text="Loading orders..." centered />
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <>
            {/* Orders table */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <span className="fw-medium">
                                {order.orderNumber}
                              </span>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                              {order.fullName || order.email}
                              <div className="small text-muted">
                                {order.email}
                              </div>
                            </td>
                            <td>₫{formatPrice(order.total)}</td>
                            <td>
                              <Badge
                                className={`${getStatusBadgeClass(
                                  order.status[0]?.status
                                )} py-2 px-3`}
                              >
                                {formatStatus(order.status[0]?.status)}
                              </Badge>
                            </td>
                            <td>
                              <Link
                                to={`/admin/orders/${order._id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <div className="text-muted">No orders found</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Orders pagination">
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
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </button>
                    </li>

                    {/* Page numbers */}
                    {[...Array(pagination.totalPages).keys()].map((i) => {
                      const pageNum = i + 1;
                      // Show only current page, previous, next and first/last pages
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.page - 1 &&
                          pageNum <= pagination.page + 1)
                      ) {
                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${
                              pagination.page === pageNum ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      }

                      // Add ellipsis if needed
                      if (
                        (pageNum === 2 && pagination.page > 3) ||
                        (pageNum === pagination.totalPages - 1 &&
                          pagination.page < pagination.totalPages - 2)
                      ) {
                        return (
                          <li
                            key={`ellipsis-${pageNum}`}
                            className="page-item disabled"
                          >
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
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
