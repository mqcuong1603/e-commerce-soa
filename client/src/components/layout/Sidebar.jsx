import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import productService from "../../services/product.service";

const Sidebar = ({ className = "" }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [expanded, setExpanded] = useState({});

  // Fetch categories for sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await productService.getCategoryTree();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle price range input
  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Apply price filter
  const applyPriceFilter = () => {
    // Construct URL with price range parameters
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("minPrice", priceRange.min);
    searchParams.set("maxPrice", priceRange.max);

    // Navigate to products page with filters
    window.location.href = `/products?${searchParams.toString()}`;
  };

  // Reset price filter
  const resetPriceFilter = () => {
    setPriceRange({ min: 0, max: 10000000 });

    // Remove price parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("minPrice");
    searchParams.delete("maxPrice");

    // Navigate to products page without price filters
    window.location.href = `/products?${searchParams.toString()}`;
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Render category tree recursively
  const renderCategories = (categories, level = 0) => {
    if (!categories || categories.length === 0) return null;

    return (
      <ul
        className={`list-unstyled ${level > 0 ? "ms-3 border-start ps-2" : ""}`}
      >
        {categories.map((category) => {
          const hasChildren = category.children && category.children.length > 0;
          const isExpanded = expanded[category._id];
          const isActive = location.pathname === `/category/${category.slug}`;

          return (
            <li key={category._id} className="mb-2">
              <div className="d-flex align-items-center justify-content-between">
                <Link
                  to={`/category/${category.slug}`}
                  className={`text-decoration-none ${
                    isActive ? "text-danger fw-bold" : "text-dark"
                  }`}
                >
                  {category.name}
                </Link>
                {hasChildren && (
                  <button
                    className="btn btn-sm text-dark p-0 ms-2"
                    onClick={() => toggleCategory(category._id)}
                  >
                    <i
                      className={`bi ${isExpanded ? "bi-dash" : "bi-plus"}`}
                    ></i>
                  </button>
                )}
              </div>
              {hasChildren &&
                isExpanded &&
                renderCategories(category.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={`card shadow-sm ${className}`}>
      {/* Categories Section */}
      <div className="card-body">
        <h5 className="card-title mb-3 fw-bold">Categories</h5>
        {loading ? (
          <div className="d-flex justify-content-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          renderCategories(categories)
        )}
      </div>

      {/* Price Filter */}
      <div className="card-body border-top">
        <h5 className="card-title mb-3 fw-bold">Price Range</h5>
        <div className="mb-3">
          <label htmlFor="minPrice" className="form-label">
            Min Price (₫)
          </label>
          <input
            type="number"
            className="form-control form-control-sm"
            id="minPrice"
            value={priceRange.min}
            onChange={(e) => handlePriceChange(e, "min")}
            min="0"
            step="100000"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="maxPrice" className="form-label">
            Max Price (₫)
          </label>
          <input
            type="number"
            className="form-control form-control-sm"
            id="maxPrice"
            value={priceRange.max}
            onChange={(e) => handlePriceChange(e, "max")}
            min="0"
            step="100000"
          />
        </div>
        <div className="d-grid gap-2">
          <button onClick={applyPriceFilter} className="btn btn-sm btn-primary">
            Apply
          </button>
          <button
            onClick={resetPriceFilter}
            className="btn btn-sm btn-outline-secondary"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Popular Brands */}
      <div className="card-body border-top">
        <h5 className="card-title mb-3 fw-bold">Popular Brands</h5>
        <div className="mb-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="brand-dell"
            />
            <label className="form-check-label" htmlFor="brand-dell">
              Dell
            </label>
          </div>
        </div>
        <div className="mb-1">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="brand-hp" />
            <label className="form-check-label" htmlFor="brand-hp">
              HP
            </label>
          </div>
        </div>
        <div className="mb-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="brand-asus"
            />
            <label className="form-check-label" htmlFor="brand-asus">
              ASUS
            </label>
          </div>
        </div>
        <div className="mb-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="brand-lenovo"
            />
            <label className="form-check-label" htmlFor="brand-lenovo">
              Lenovo
            </label>
          </div>
        </div>
        <div className="mb-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="brand-msi"
            />
            <label className="form-check-label" htmlFor="brand-msi">
              MSI
            </label>
          </div>
        </div>
        <div className="mt-2">
          <button className="btn btn-link btn-sm text-decoration-none p-0">
            View All Brands
          </button>
        </div>
      </div>

      {/* Customer Service */}
      <div className="card-body border-top">
        <h5 className="card-title mb-3 fw-bold">Customer Services</h5>
        <ul className="list-unstyled">
          <li className="mb-2">
            <Link to="/contact" className="text-decoration-none text-dark">
              <i className="bi bi-telephone-fill text-danger me-2"></i>
              Contact Support
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/faq" className="text-decoration-none text-dark">
              <i className="bi bi-question-circle-fill text-danger me-2"></i>
              FAQs
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/shipping-policy"
              className="text-decoration-none text-dark"
            >
              <i className="bi bi-truck text-danger me-2"></i>
              Shipping Policy
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/returns" className="text-decoration-none text-dark">
              <i className="bi bi-arrow-return-left text-danger me-2"></i>
              Returns & Refunds
            </Link>
          </li>
        </ul>
      </div>

      {/* Featured Product */}
      <div className="card-body border-top">
        <h5 className="card-title mb-3 fw-bold">Featured Product</h5>
        <div className="card h-100 border-0">
          <img
            src="/images/products/featured-product.jpg"
            className="card-img-top"
            alt="Featured Product"
          />
          <div className="card-body px-0 pb-0">
            <h6 className="card-title">ASUS ROG Strix GeForce RTX 4070 OC</h6>
            <div className="mb-2">
              <div className="d-flex align-items-center mb-1">
                <div className="text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <span className="ms-1 text-muted small">(24)</span>
              </div>
            </div>
            <p className="fw-bold text-danger mb-2">₫24,990,000</p>
            <Link
              to="/products/asus-rog-strix-geforce-rtx-4070-oc"
              className="btn btn-sm btn-outline-danger w-100"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* User Account - Mobile Only */}
      {isAuthenticated && (
        <div className="card-body border-top d-lg-none">
          <h5 className="card-title mb-3 fw-bold">My Account</h5>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Link to="/profile" className="text-decoration-none text-dark">
                <i className="bi bi-person-fill text-danger me-2"></i>
                My Profile
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/orders" className="text-decoration-none text-dark">
                <i className="bi bi-bag-fill text-danger me-2"></i>
                My Orders
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/wishlist" className="text-decoration-none text-dark">
                <i className="bi bi-heart-fill text-danger me-2"></i>
                Wishlist
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
