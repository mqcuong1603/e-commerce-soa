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
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
    <header className="bg-white shadow-md">
      {/* Top bar with contact info and quick links */}
      <div className="bg-primary-800 text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm">
            <a href="tel:+84123456789" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +84 123 456 789
            </a>
            <a
              href="mailto:info@techstore.com"
              className="hidden sm:flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              info@techstore.com
            </a>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center space-x-1"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span>Hi, {user?.fullName?.split(" ")[0] || "User"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/register" className="hover:underline">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header with logo, search, and cart */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            TechStore
          </Link>

          {/* Search */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <div>
              <div className="text-xs text-gray-500">Shopping Cart</div>
              <div className="text-sm font-medium">
                {cart.itemCount || 0} items
              </div>
            </div>
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-100 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Categories dropdown */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                className="flex items-center space-x-2 px-4 py-3 font-medium hover:bg-gray-200"
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>Categories</span>
              </button>

              {categoryMenuOpen && (
                <div className="absolute top-full left-0 w-60 bg-white shadow-lg z-50">
                  {loading ? (
                    <div className="p-4 text-center">Loading...</div>
                  ) : (
                    <div className="py-2">
                      {categories.map((category) => (
                        <div key={category._id} className="group relative">
                          <Link
                            to={`/category/${category.slug}`}
                            className="block px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                          >
                            {category.name}
                            {category.children &&
                              category.children.length > 0 && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              )}
                          </Link>

                          {/* Submenu */}
                          {category.children &&
                            category.children.length > 0 && (
                              <div className="hidden group-hover:block absolute top-0 left-full w-60 bg-white shadow-lg">
                                {category.children.map((subCategory) => (
                                  <Link
                                    key={subCategory._id}
                                    to={`/category/${subCategory.slug}`}
                                    className="block px-4 py-2 hover:bg-gray-100"
                                  >
                                    {subCategory.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main navigation links */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="py-3 font-medium hover:text-primary-600">
                Home
              </Link>
              <Link
                to="/products"
                className="py-3 font-medium hover:text-primary-600"
              >
                All Products
              </Link>
              <Link
                to="/category/laptops"
                className="py-3 font-medium hover:text-primary-600"
              >
                Laptops
              </Link>
              <Link
                to="/category/monitors"
                className="py-3 font-medium hover:text-primary-600"
              >
                Monitors
              </Link>
              <Link
                to="/about"
                className="py-3 font-medium hover:text-primary-600"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="py-3 font-medium hover:text-primary-600"
              >
                Contact
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden py-2 border-t border-gray-200">
              <Link to="/" className="block py-2 px-4 hover:bg-gray-200">
                Home
              </Link>
              <Link
                to="/products"
                className="block py-2 px-4 hover:bg-gray-200"
              >
                All Products
              </Link>
              <Link
                to="/category/laptops"
                className="block py-2 px-4 hover:bg-gray-200"
              >
                Laptops
              </Link>
              <Link
                to="/category/monitors"
                className="block py-2 px-4 hover:bg-gray-200"
              >
                Monitors
              </Link>
              <Link to="/about" className="block py-2 px-4 hover:bg-gray-200">
                About Us
              </Link>
              <Link to="/contact" className="block py-2 px-4 hover:bg-gray-200">
                Contact
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
