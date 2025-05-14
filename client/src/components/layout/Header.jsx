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
  const [selectedMainCategory, setSelectedMainCategory] = useState("");

  useEffect(() => {
    if (!categoryMenuOpen) {
      // Reset selected category when menu closes
      setTimeout(() => {
        setSelectedMainCategory("");
      }, 300);
    } else if (categories.length > 0) {
      // Select first category with children by default
      const firstWithChildren = categories.find(
        (cat) => cat.children?.length > 0
      );
      if (firstWithChildren) {
        setSelectedMainCategory(firstWithChildren.slug);
      }
    }
  }, [categoryMenuOpen, categories]);

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
    <header className="sticky-top shadow-sm">
      {/* Top header with contact and account info */}
      <div className="bg-dark text-white py-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
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
                  <i className="bi bi-envelope-fill me-1"></i>{" "}
                  info@techstore.com
                </a>
              </div>
            </div>

            <div className="col-md-4 d-flex justify-content-end">
              {isAuthenticated ? (
                <div className="dropdown" ref={userMenuRef}>
                  <button
                    className="btn btn-link text-white text-decoration-none dropdown-toggle p-0"
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    Hi, {user?.fullName?.split(" ")[0] || "User"}
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-sm mt-2 ${
                      userMenuOpen ? "show" : ""
                    }`}
                  >
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2 text-secondary"></i>
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/orders">
                        <i className="bi bi-box me-2 text-secondary"></i>
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
                        <i className="bi bi-box-arrow-right me-2"></i>
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
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-white text-decoration-none small"
                  >
                    <i className="bi bi-person-plus me-1"></i> Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header with logo, categories, search and cart */}
      <div className="bg-white py-3 border-bottom">
        <div className="container">
          <div className="row align-items-center g-3">
            {/* Logo */}
            <div className="col-md-2 text-center text-md-start">
              <Link to="/" className="text-decoration-none">
                <h1 className="m-0 h3 fw-bold text-danger">TechStore</h1>
              </Link>
            </div>

            {/* Categories dropdown - moved here */}
            <div className="col-md-2">
              <div className="dropdown" ref={categoryMenuRef}>
                <button
                  className="btn btn-danger dropdown-toggle d-flex align-items-center w-100 justify-content-center"
                  type="button"
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  aria-expanded={categoryMenuOpen}
                >
                  <i className="bi bi-grid me-2"></i> Categories
                </button>

                {/* Categories dropdown menu */}
                <div
                  className={`dropdown-menu shadow border-0 mt-1 ${
                    categoryMenuOpen ? "show" : ""
                  }`}
                  style={{ maxHeight: "450px", overflowY: "auto" }}
                >
                  <div>
                    <Link
                      to="/products"
                      className="dropdown-item py-2 d-flex align-items-center border-bottom"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      <i className="bi bi-grid-3x3-gap me-2 text-danger"></i>
                      <strong>All Products</strong>
                    </Link>

                    {/* Computer Hardware Category Group */}
                    <div className="py-1">
                      <h6 className="dropdown-header text-uppercase small fw-semibold text-dark">
                        Computer Hardware
                      </h6>

                      <Link
                        to="/category/laptops"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-laptop me-2 text-secondary"></i>
                        Laptops
                      </Link>

                      <Link
                        to="/category/ultrabooks"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-laptop me-2 text-secondary"></i>
                        Ultrabooks
                      </Link>

                      <Link
                        to="/category/gaming-laptops"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-controller me-2 text-secondary"></i>
                        Gaming Laptops
                      </Link>
                    </div>

                    {/* Components Category Group */}
                    <div className="py-1 border-top">
                      <h6 className="dropdown-header text-uppercase small fw-semibold text-dark">
                        Components
                      </h6>

                      <Link
                        to="/category/desktop-ram"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-memory me-2 text-secondary"></i>
                        Desktop RAM
                      </Link>

                      <Link
                        to="/category/laptop-ram"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-memory me-2 text-secondary"></i>
                        Laptop RAM
                      </Link>
                    </div>

                    {/* Graphics Cards Category Group */}
                    <div className="py-1 border-top">
                      <h6 className="dropdown-header text-uppercase small fw-semibold text-dark">
                        Graphics Cards
                      </h6>

                      <Link
                        to="/category/nvidia-gpus"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-gpu-card me-2 text-secondary"></i>
                        NVIDIA GPUs
                      </Link>

                      <Link
                        to="/category/amd-gpus"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-gpu-card me-2 text-secondary"></i>
                        AMD GPUs
                      </Link>
                    </div>

                    {/* Storage Category Group */}
                    <div className="py-1 border-top">
                      <h6 className="dropdown-header text-uppercase small fw-semibold text-dark">
                        Storage
                      </h6>

                      <Link
                        to="/category/internal-ssd"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-device-ssd me-2 text-secondary"></i>
                        Internal SSD
                      </Link>

                      <Link
                        to="/category/internal-hdd"
                        className="dropdown-item py-2 ps-3"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-device-hdd me-2 text-secondary"></i>
                        Internal HDD
                      </Link>
                    </div>

                    <div className="dropdown-item border-top pt-2">
                      <Link
                        to="/categories"
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <i className="bi bi-grid-3x3-gap me-2"></i>
                        View All Categories
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search form - adjusted column width */}
            <div className="col-md-5">
              <form onSubmit={handleSearch} className="d-flex">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="form-control border-end-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="btn btn-danger"
                    aria-label="Search"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Common links - Added new */}
            <div className="col-md-2 d-none d-md-flex justify-content-end">
              <div className="d-flex gap-3">
                <Link to="/products" className="text-decoration-none text-dark">
                  Products
                </Link>
                <Link to="/about" className="text-decoration-none text-dark">
                  About
                </Link>
              </div>
            </div>

            {/* Cart */}
            <div className="col-md-1 text-end">
              <Link
                to="/cart"
                className="btn btn-outline-danger position-relative"
              >
                <i className="bi bi-cart3 me-1"></i>
                {cart.itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cart.itemCount}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
