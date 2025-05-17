import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import adminService from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { toast } from "react-toastify";

const AdminProductsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "all",
  });

  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Add state for categories
  const [categories, setCategories] = useState([]);

  // Categories and statuses for filter dropdown
  const [statuses, setStatuses] = useState([
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/admin/products" } } });
    } else if (user && user.role !== "admin") {
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch products when component mounts or filters/pagination changes
  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filters]);
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminService.getParentCategories();
        if (response.success) {
          // Add "All Categories" option
          const formattedCategories = [
            { _id: "", name: "All Categories" },
            ...response.data,
          ];
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await adminService.getProductsAdmin(params);

      if (response.success) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Create debounced search function
  const debouncedSearch = useCallback((term) => {
    // Create a cleaner debounce implementation
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setFilters((prev) => ({ ...prev, search: term }));
        setPagination((prev) => ({ ...prev, page: 1 }));
      }, 300);
    };
  }, []);

  // Handle search input change with proper debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear any previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set a new timeout
    window.searchTimeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
  };
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // For status filter, make sure we handle it correctly
    if (name === "status") {
      // Only set status if it's active or inactive, otherwise use empty string
      const statusValue =
        value === "active" || value === "inactive" ? value : "";
      setFilters((prev) => ({ ...prev, status: statusValue }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }

    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "all",
    });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };
  // Status toggle handler
  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      // Send a boolean value for status
      const newStatus = !currentStatus;

      const response = await adminService.updateProductStatus(productId, {
        isActive: newStatus, // Send boolean value directly
      });

      if (response.success) {
        // Update the product in the local state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId
              ? { ...product, isActive: newStatus }
              : product
          )
        );

        toast.success(
          `Product ${newStatus ? "activated" : "deactivated"} successfully`
        );
      } else {
        toast.error(response.message || "Failed to update product status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred while updating the status");
    }
  };

  // Handle delete product
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeletingProduct(true);

      const response = await adminService.deleteProduct(productToDelete._id);

      if (response.success) {
        // Remove product from list
        setProducts(products.filter((p) => p._id !== productToDelete._id));

        toast.success("Product deleted successfully");
        setShowDeleteModal(false);
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingProduct(false);
    }
  };

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <Loader text="Loading product management..." />;
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* Header with title and add product button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">
              <i className="bi bi-box-seam text-primary fs-3 me-2"></i>
              Product Management
            </h1>
            <p className="text-muted mb-0">Manage your store products</p>
          </div>
          <Button
            variant="primary"
            as={Link}
            to="/admin/products/create"
            className="d-flex align-items-center"
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add New Product
          </Button>
        </div>

        {/* Search and filters UI */}
        <div className="row g-3 mb-4">
          {/* Search */}
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-folder"></i>
              </span>
              <select
                className="form-select"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status filter */}
          <div className="col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-toggle-on"></i>
              </span>{" "}
              <select
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={handleResetFilters}
              disabled={!filters.search && !filters.category && !filters.status}
            >
              <i className="bi bi-x-circle me-1"></i> Reset
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>
              <h5 className="mb-1">Error Loading Products</h5>
              <p className="mb-0">{error}</p>
              <Button
                variant="outline-danger"
                size="sm"
                className="mt-2"
                onClick={fetchProducts}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Retry
              </Button>
            </div>
          </div>
        )}

        {/* Products table */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center p-5 bg-light rounded-3 shadow-sm">
                <div className="mb-4">
                  <i
                    className="bi bi-box text-secondary"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>
                <h5 className="text-secondary">No products found</h5>
                <p className="text-muted mb-4">
                  Try adjusting your filters or add new products
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={handleResetFilters}
                  >
                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                    Reset Filters
                  </Button>
                  <Button
                    variant="primary"
                    as={Link}
                    to="/admin/products/create"
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Product
                  </Button>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: "80px" }}>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="py-5">
                            <i className="bi bi-box fs-1 text-secondary mb-3"></i>
                            <h5>No products found</h5>
                            <p className="text-muted">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            {product.mainImage ? (
                              <img
                                src={product.mainImage.imageUrl}
                                alt={product.name}
                                className="img-thumbnail"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/placeholder.png";
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{ width: "60px", height: "60px" }}
                              >
                                <i className="bi bi-image text-secondary"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-medium">{product.name}</div>
                            <div className="small text-muted">
                              ID: {product._id}
                            </div>
                          </td>
                          <td>
                            {product.categories && product.categories.length > 0
                              ? product.categories[0].name
                              : "Uncategorized"}
                          </td>
                          <td>₫{formatPrice(product.basePrice)}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={product.isActive}
                                onChange={() =>
                                  handleToggleStatus(
                                    product._id,
                                    product.isActive
                                  )
                                }
                              />
                              <span
                                className={`badge ${
                                  product.isActive
                                    ? "bg-success"
                                    : "bg-secondary"
                                } ms-2`}
                              >
                                {product.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  navigate(
                                    `/admin/products/${product._id}/edit`
                                  )
                                }
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteClick(product._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  showFirstLastButtons
                />
                <div className="text-muted text-center mt-2">
                  <small>
                    Showing {products.length} of {pagination.total} products
                  </small>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Delete Product Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Delete Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this product?</p>
            {productToDelete && (
              <div className="alert alert-light">
                <div className="fw-bold">{productToDelete.name}</div>
                <div className="small text-muted">
                  ID: {productToDelete._id}
                </div>
              </div>
            )}
            <p className="text-danger mb-0">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deletingProduct}
            >
              {deletingProduct ? (
                <>
                  <Spinner
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                    className="me-2"
                  />
                  Deleting...
                </>
              ) : (
                <>Delete Product</>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
