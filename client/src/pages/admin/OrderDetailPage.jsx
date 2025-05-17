import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import adminService from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/ui/Loader";
import { Card, Badge, Form, Button, Row, Col, Alert } from "react-bootstrap";

const AdminOrderDetailPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    note: "",
  });
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: `/admin/orders/${id}` } },
      });
    } else if (user && user.role !== "admin") {
      navigate("/");
    } else {
      fetchOrderDetails();
    }
  }, [isAuthenticated, user, navigate, id]);
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getOrderDetails(id);

      if (response.success) {
        setOrder(response.data);

        // Set current status for the update form
        if (
          response.data.statusHistory &&
          response.data.statusHistory.length > 0
        ) {
          setStatusUpdate((prev) => ({
            ...prev,
            status: response.data.statusHistory[0].status,
          }));
        }
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

  const handleStatusUpdateChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdate((prev) => ({ ...prev, [name]: value }));
    // Clear previous success message when form changes
    if (updateSuccess) setUpdateSuccess(false);
  };
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);

      const response = await adminService.updateOrderStatus(id, statusUpdate);

      if (response.success) {
        setUpdateSuccess(true);
        // Refresh order details
        fetchOrderDetails();
      } else {
        throw new Error(response.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update order status. Please try again."
      );
    } finally {
      setUpdating(false);
    }
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

  // Get available status options based on current status
  const getAvailableStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: "pending", label: "Pending", order: 0 },
      { value: "confirmed", label: "Confirmed", order: 1 },
      { value: "processing", label: "Processing", order: 2 },
      { value: "shipping", label: "Shipping", order: 3 },
      { value: "delivered", label: "Delivered", order: 4 },
      { value: "cancelled", label: "Cancelled", order: 5 },
    ];

    // If status is already cancelled or delivered, only show the current status
    if (currentStatus === "cancelled" || currentStatus === "delivered") {
      return allStatuses.filter((status) => status.value === currentStatus);
    }

    // Find the order of the current status
    const currentStatusOrder =
      allStatuses.find((status) => status.value === currentStatus)?.order || 0;

    // Return current status and all statuses that come after it in the workflow
    // plus cancelled which can be selected from any non-final state
    return allStatuses.filter(
      (status) =>
        status.order >= currentStatusOrder || status.value === "cancelled"
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <Loader text="Loading order details..." centered />
        </div>
      </AdminLayout>
    );
  }
  if (error || !order) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <Alert variant="danger">
            {error || "Failed to load order details. Please try again."}
          </Alert>
          <div className="text-center mt-4">
            <Link to="/admin/orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) return null;
  // Get current status
  const currentStatus =
    order.statusHistory && order.statusHistory.length > 0
      ? order.statusHistory[0]
      : { status: "pending", createdAt: order.createdAt };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Order #{order.orderNumber}</h1>
          <Button
            variant="outline-primary"
            onClick={() => navigate("/admin/orders")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Orders
          </Button>
        </div>

        <Row className="g-4">
          {/* Left column - Order details */}
          <Col lg={8}>
            {/* Order header */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <Row className="mb-3 align-items-center">
                  <Col md={6}>
                    <h5 className="mb-1">Order Information</h5>
                    <p className="text-muted mb-0">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <Badge
                      className={`${getStatusBadgeClass(
                        currentStatus?.status
                      )} px-3 py-2`}
                    >
                      {formatStatus(currentStatus?.status)}
                    </Badge>
                  </Col>
                </Row>

                <hr className="my-3" />

                <Row className="mb-3">
                  <Col md={6}>
                    <h6 className="mb-2">Customer Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {order.fullName}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p className="mb-0">
                      <strong>Phone:</strong>{" "}
                      {order.shippingAddress?.phone || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6 className="mb-2">Shipping Address</h6>
                    <p className="mb-1">{order.shippingAddress?.street}</p>
                    <p className="mb-1">
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.zipCode}
                    </p>
                    <p className="mb-0">{order.shippingAddress?.country}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Order items */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light py-3">
                <h5 className="mb-0">Order Items</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Product</th>
                        <th>Variant</th>
                        <th className="text-center">Price</th>
                        <th className="text-center">Quantity</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="fw-medium">{item.productName}</div>
                          </td>
                          <td>{item.variantName}</td>
                          <td className="text-center">
                            ₫{formatPrice(item.price)}
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            ₫{formatPrice(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>

            {/* Order status history */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light py-3">
                <h5 className="mb-0">Status History</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Status</th>
                        <th>Note</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.statusHistory && order.statusHistory.length > 0 ? (
                        order.statusHistory.map((status, index) => (
                          <tr key={index}>
                            <td>
                              <Badge
                                className={`${getStatusBadgeClass(
                                  status.status
                                )} px-3 py-2`}
                              >
                                {formatStatus(status.status)}
                              </Badge>
                            </td>
                            <td>{status.note || "-"}</td>
                            <td>{formatDate(status.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4">
                            No status history available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right column - Order summary and actions */}
          <Col lg={4}>
            {/* Order summary */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light py-3">
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₫{formatPrice(order.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>₫{formatPrice(order.shippingFee)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>₫{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount:</span>
                    <span className="text-danger">
                      -₫{formatPrice(order.discountAmount)}
                    </span>
                  </div>
                )}
                {order.discountCode && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Discount Code:</span>
                    <span className="text-muted small">
                      {order.discountCode}
                    </span>
                  </div>
                )}{" "}
                {order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Loyalty Points Used:</span>
                    <span className="text-danger">
                      -₫
                      {formatPrice(
                        Math.min(order.loyaltyPointsUsed * 1000, 1000000)
                      )}
                    </span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-2 fw-bold">
                  <span>Total:</span>
                  <span>₫{formatPrice(order.total)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Payment Method:</span>
                  <span className="text-muted small">Cash on Delivery</span>
                </div>
              </Card.Body>
            </Card>

            {/* Update status */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light py-3">
                <h5 className="mb-0">Update Order Status</h5>
              </Card.Header>
              <Card.Body>
                {updateSuccess && (
                  <Alert variant="success" className="mb-3">
                    Order status updated successfully.
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleStatusUpdate}>
                  {" "}
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={statusUpdate.status}
                      onChange={handleStatusUpdateChange}
                      required
                    >
                      {getAvailableStatusOptions(
                        currentStatus?.status || "pending"
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Only forward status progression or cancellation is allowed
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Note (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="note"
                      value={statusUpdate.note}
                      onChange={handleStatusUpdateChange}
                      placeholder="Add a note about this status change"
                      rows={3}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;
