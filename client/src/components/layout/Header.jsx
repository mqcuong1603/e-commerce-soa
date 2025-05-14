import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/product.service";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Fetch navigation menu categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getMenuCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      ) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      {/* Top header with contact and account info */}
      <div className="bg-dark text-white py-2">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <a
              href="tel:+84123456789"
              className="text-white text-decoration-none me-3 small"
            >
              <i className="bi bi-telephone-fill me-1"></i> +84 123 456 789
            </a>
            <a
              href="mailto:info@techstore.com"
              className="text-white text-decoration-none small d-none d-md-inline"
            >
              <i className="bi bi-envelope-fill me-1"></i> info@techstore.com
            </a>
          </div>

          <div>
            {isAuthenticated ? (
              <div className="dropdown" ref={userMenuRef}>
                <button
                  className="btn btn-link text-white text-decoration-none dropdown-toggle p-0"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  Hi, {user?.fullName?.split(" ")[0] || "User"}
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end shadow-sm ${
                    userMenuOpen ? "show" : ""
                  }`}
                >
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-3">
                <Link
                  to="/login"
                  className="text-white text-decoration-none small"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white text-decoration-none small"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header with logo, search and cart */}
      <div className="bg-white py-3 border-bottom">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-md-3 mb-3 mb-md-0 text-center text-md-start">
              <Link to="/" className="text-decoration-none">
                <h1 className="m-0 h3 fw-bold text-danger">TechStore</h1>
              </Link>
            </div>

            {/* Search form */}
            <div className="col-md-6 mb-3 mb-md-0">
              <form onSubmit={handleSearch} className="d-flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-control me-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-danger">
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>

            {/* Cart */}
            <div className="col-md-3 text-end">
              <Link
                to="/cart"
                className="btn btn-outline-danger position-relative"
              >
                <i className="bi bi-cart3 me-1"></i> Cart
                {cart.itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cart.itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <div className="dropdown me-3" ref={categoryMenuRef}>
            <button
              className="btn btn-danger dropdown-toggle d-flex align-items-center"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
            >
              <i className="bi bi-list me-2"></i> Categories
            </button>

            <div
              className={`dropdown-menu shadow-sm ${
                categoryMenuOpen ? "show" : ""
              }`}
              style={{ width: "250px" }}
            >
              {loading ? (
                <div className="text-center py-2">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category._id} className="dropend">
                    <Link
                      to={`/category/${category.slug}`}
                      className="dropdown-item d-flex justify-content-between align-items-center"
                    >
                      {category.name}
                      {category.children && category.children.length > 0 && (
                        <i className="bi bi-chevron-right"></i>
                      )}
                    </Link>

                    {category.children && category.children.length > 0 && (
                      <div className="dropdown-menu shadow-sm dropdown-menu-end">
                        {category.children.map((subcategory) => (
                          <Link
                            key={subcategory._id}
                            to={`/category/${subcategory.slug}`}
                            className="dropdown-item"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  to="/"
                  className={`nav-link ${
                    location.pathname === "/" ? "active fw-bold" : ""
                  }`}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/products"
                  className={`nav-link ${
                    location.pathname === "/products" ? "active fw-bold" : ""
                  }`}
                >
                  All Products
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/category/laptops"
                  className={`nav-link ${
                    location.pathname === "/category/laptops"
                      ? "active fw-bold"
                      : ""
                  }`}
                >
                  Laptops
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/category/monitors"
                  className={`nav-link ${
                    location.pathname === "/category/monitors"
                      ? "active fw-bold"
                      : ""
                  }`}
                >
                  Monitors
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/about"
                  className={`nav-link ${
                    location.pathname === "/about" ? "active fw-bold" : ""
                  }`}
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/contact"
                  className={`nav-link ${
                    location.pathname === "/contact" ? "active fw-bold" : ""
                  }`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
