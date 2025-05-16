import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
// Replace axios import with adminService
import adminService from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import Loader from "../../components/ui/Loader";
import {
  Card,
  Form,
  Button,
  Badge,
  Row,
  Col,
  Table,
  Modal,
  Alert,
} from "react-bootstrap";

const AdminDiscountPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [selectedDiscountOrders, setSelectedDiscountOrders] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    usageLimit: 5,
  });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/admin/discounts" } } });
    } else if (user && user.role !== "admin") {
      navigate("/");
    } else {
      fetchDiscounts();
    }
  }, [isAuthenticated, user, navigate, pagination.page]);

  // Fetch all discount codes with pagination
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getDiscounts(
        pagination.page,
        pagination.limit
      );

      if (response.success) {
        setDiscounts(response.data.discountCodes || []);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.message || "Failed to fetch discount codes");
      }
    } catch (err) {
      console.error("Error fetching discount codes:", err);
      setError("Failed to load discount codes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo(0, 0);
    }
  };

  // Handle form change for new discount
  const handleNewDiscountChange = (e) => {
    const { name, value } = e.target;
    setNewDiscount((prev) => ({
      ...prev,
      [name]:
        name === "discountValue" || name === "usageLimit"
          ? Number(value)
          : value,
    }));
  };

  // Generate a random 5-character discount code
  const generateRandomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    setNewDiscount((prev) => ({ ...prev, code: result }));
  };

  // Create new discount code
  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setFormError("");

      // Validate form
      if (!newDiscount.code || newDiscount.code.length !== 5) {
        setFormError("Discount code must be 5 characters");
        setCreating(false);
        return;
      }

      const response = await adminService.createDiscount(newDiscount);

      if (response.success) {
        setSuccess("Discount code created successfully!");
        setShowCreateModal(false);
        setNewDiscount({
          code: "",
          discountType: "percentage",
          discountValue: 10,
          usageLimit: 5,
        });
        fetchDiscounts();
      } else {
        throw new Error(response.message || "Failed to create discount code");
      }
    } catch (err) {
      console.error("Error creating discount code:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to create discount code. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  // View discount details
  const handleViewDetails = async (code) => {
    try {
      setLoading(true);

      const response = await adminService.getDiscountDetails(code);

      if (response.success) {
        setSelectedDiscount(response.data.discountCode);
        setSelectedDiscountOrders(response.data.usage?.orders || []);
        setShowDetailModal(true);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch discount details"
        );
      }
    } catch (err) {
      console.error("Error fetching discount details:", err);
      setError("Failed to load discount details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle discount status
  const handleToggleStatus = async (code) => {
    try {
      const response = await adminService.toggleDiscountStatus(code);

      if (response.success) {
        setSuccess(
          `Discount code ${
            response.data.isActive ? "activated" : "deactivated"
          } successfully!`
        );
        fetchDiscounts();
      } else {
        throw new Error(
          response.data.message || "Failed to update discount code"
        );
      }
    } catch (err) {
      console.error("Error updating discount code:", err);
      setError("Failed to update discount code. Please try again.");
    }
  };

  // Delete discount code
  const handleDeleteDiscount = async (code) => {
    if (
      window.confirm(`Are you sure you want to delete discount code ${code}?`)
    ) {
      try {
        const response = await adminService.deleteDiscount(code);

        if (response.success) {
          setSuccess("Discount code deleted successfully!");
          fetchDiscounts();
        } else {
          throw new Error(
            response.data.message || "Failed to delete discount code"
          );
        }
      } catch (err) {
        console.error("Error deleting discount code:", err);
        setError(
          err.response?.data?.message ||
            "Failed to delete discount code. Please try again."
        );
      }
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

  // Format discount value
  const formatDiscountValue = (discount) => {
    if (discount.discountType === "percentage") {
      return `${discount.discountValue}%`;
    }
    return `₫${discount.discountValue.toLocaleString("en-US")}`;
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Discount Management</h1>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            Create Discount Code
          </Button>
        </div>

        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {/* Discount codes table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading && !discounts.length ? (
              <div className="text-center py-5">
                <Loader text="Loading discount codes..." centered />
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Usage</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.length > 0 ? (
                      discounts.map((discount) => (
                        <tr key={discount._id}>
                          <td>
                            <span className="fw-medium">{discount.code}</span>
                          </td>
                          <td>{formatDiscountValue(discount)}</td>
                          <td>
                            {discount.usedCount}/{discount.usageLimit}
                          </td>
                          <td>
                            <Badge
                              bg={discount.isActive ? "success" : "secondary"}
                              className="py-2 px-3"
                            >
                              {discount.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td>{formatDate(discount.createdAt)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleViewDetails(discount.code)}
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                              <Button
                                variant={
                                  discount.isActive
                                    ? "outline-secondary"
                                    : "outline-success"
                                }
                                size="sm"
                                onClick={() =>
                                  handleToggleStatus(discount.code)
                                }
                              >
                                <i
                                  className={`bi bi-${
                                    discount.isActive ? "pause" : "play"
                                  }`}
                                ></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleDeleteDiscount(discount.code)
                                }
                                disabled={discount.usedCount > 0}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <p className="text-muted mb-0">
                            No discount codes found
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Discount codes pagination">
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
                    pagination.page === pagination.totalPages ? "disabled" : ""
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

        {/* Create discount modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create Discount Code</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form onSubmit={handleCreateDiscount}>
              <Form.Group className="mb-3">
                <Form.Label>Discount Code</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    name="code"
                    value={newDiscount.code}
                    onChange={handleNewDiscountChange}
                    placeholder="Enter 5-character code"
                    maxLength={5}
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={generateRandomCode}
                    type="button"
                  >
                    Generate
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  5 characters, letters and numbers only
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Discount Type</Form.Label>
                <Form.Select
                  name="discountType"
                  value={newDiscount.discountType}
                  onChange={handleNewDiscountChange}
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₫)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  {newDiscount.discountType === "percentage"
                    ? "Discount Percentage"
                    : "Discount Amount"}
                </Form.Label>
                <Form.Control
                  type="number"
                  name="discountValue"
                  value={newDiscount.discountValue}
                  onChange={handleNewDiscountChange}
                  min={1}
                  max={
                    newDiscount.discountType === "percentage" ? 100 : undefined
                  }
                  required
                />
                {newDiscount.discountType === "percentage" && (
                  <Form.Text className="text-muted">
                    Must be between 1 and 100
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Usage Limit</Form.Label>
                <Form.Control
                  type="number"
                  name="usageLimit"
                  value={newDiscount.usageLimit}
                  onChange={handleNewDiscountChange}
                  min={1}
                  max={10}
                  required
                />
                <Form.Text className="text-muted">
                  Maximum number of times this code can be used (1-10)
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Discount"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Discount details modal */}
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Discount Code Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedDiscount && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Code:</strong> {selectedDiscount.code}
                    </p>
                    <p className="mb-1">
                      <strong>Type:</strong>{" "}
                      {selectedDiscount.discountType === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </p>
                    <p className="mb-1">
                      <strong>Value:</strong>{" "}
                      {formatDiscountValue(selectedDiscount)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      <strong>Status:</strong>{" "}
                      <Badge
                        bg={selectedDiscount.isActive ? "success" : "secondary"}
                      >
                        {selectedDiscount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                    <p className="mb-1">
                      <strong>Created:</strong>{" "}
                      {formatDate(selectedDiscount.createdAt)}
                    </p>
                    <p className="mb-1">
                      <strong>Usage:</strong> {selectedDiscount.usedCount}/
                      {selectedDiscount.usageLimit}
                    </p>
                  </Col>
                </Row>

                <h6 className="mb-3">Orders Using This Code</h6>
                {selectedDiscountOrders.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Discount Amount</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDiscountOrders.map((order) => (
                          <tr key={order._id}>
                            <td>{order.orderNumber}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>{order.fullName || order.email}</td>
                            <td>
                              ₫{order.discountAmount.toLocaleString("en-US")}
                            </td>
                            <td>₫{order.total.toLocaleString("en-US")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted">
                    No orders have used this code yet
                  </p>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminDiscountPage;
