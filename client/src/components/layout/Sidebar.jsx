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
      <ul className={`space-y-1 ${level > 0 ? "ml-4" : ""}`}>
        {categories.map((category) => {
          const hasChildren = category.children && category.children.length > 0;
          const isExpanded = expanded[category._id];

          return (
            <li key={category._id}>
              <div className="flex items-center justify-between py-1">
                <Link
                  to={`/category/${category.slug}`}
                  className={`hover:text-primary-600 flex-grow ${
                    location.pathname === `/category/${category.slug}`
                      ? "font-medium text-primary-600"
                      : "text-gray-700"
                  }`}
                >
                  {category.name}
                </Link>
                {hasChildren && (
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => toggleCategory(category._id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? "transform rotate-180" : ""
                      }`}
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
    <aside className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Categories Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 pb-2 border-b">Categories</h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-5 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          renderCategories(categories)
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 pb-2 border-b">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="minPrice"
              className="block text-sm text-gray-600 mb-1"
            >
              Min Price (₫)
            </label>
            <input
              type="number"
              id="minPrice"
              value={priceRange.min}
              onChange={(e) => handlePriceChange(e, "min")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              min="0"
              step="100000"
            />
          </div>
          <div>
            <label
              htmlFor="maxPrice"
              className="block text-sm text-gray-600 mb-1"
            >
              Max Price (₫)
            </label>
            <input
              type="number"
              id="maxPrice"
              value={priceRange.max}
              onChange={(e) => handlePriceChange(e, "max")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              min="0"
              step="100000"
            />
          </div>
          <div className="flex space-x-2 pt-2">
            <button
              onClick={applyPriceFilter}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Apply
            </button>
            <button
              onClick={resetPriceFilter}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Popular Brands */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 pb-2 border-b">Popular Brands</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="brand-dell"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="brand-dell"
              className="ml-2 block text-sm text-gray-700"
            >
              Dell
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="brand-hp"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="brand-hp"
              className="ml-2 block text-sm text-gray-700"
            >
              HP
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="brand-asus"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="brand-asus"
              className="ml-2 block text-sm text-gray-700"
            >
              ASUS
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="brand-lenovo"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="brand-lenovo"
              className="ml-2 block text-sm text-gray-700"
            >
              Lenovo
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="brand-msi"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="brand-msi"
              className="ml-2 block text-sm text-gray-700"
            >
              MSI
            </label>
          </div>
        </div>
        <div className="mt-2">
          <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            View All Brands
          </button>
        </div>
      </div>

      {/* Customer Services */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3 pb-2 border-b">
          Customer Services
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to="/contact"
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
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
              Contact Support
            </Link>
          </li>
          <li>
            <Link
              to="/faq"
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              FAQs
            </Link>
          </li>
          <li>
            <Link
              to="/shipping-policy"
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              Shipping Policy
            </Link>
          </li>
          <li>
            <Link
              to="/returns"
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                />
              </svg>
              Returns & Refunds
            </Link>
          </li>
        </ul>
      </div>

      {/* Featured Product */}
      <div>
        <h3 className="text-lg font-bold mb-3 pb-2 border-b">
          Featured Product
        </h3>
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <div className="mb-2">
            <img
              src="/images/products/featured-product.jpg"
              alt="Featured Product"
              className="w-full h-auto rounded"
            />
          </div>
          <h4 className="font-medium text-sm mb-1">
            ASUS ROG Strix GeForce RTX 4070 OC
          </h4>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < 5 ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs ml-1 text-gray-500">(24)</span>
            </div>
          </div>
          <div className="text-primary-600 font-semibold mb-2">₫24,990,000</div>
          <Link
            to="/products/asus-rog-strix-geforce-rtx-4070-oc"
            className="bg-primary-600 text-white text-xs py-1 px-3 rounded block text-center hover:bg-primary-700"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* User Account (for mobile) - shown only on smaller screens */}
      {isAuthenticated && (
        <div className="mt-6 lg:hidden">
          <h3 className="text-lg font-bold mb-3 pb-2 border-b">My Account</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/profile"
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
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
                My Orders
              </Link>
            </li>
            <li>
              <Link
                to="/wishlist"
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Wishlist
              </Link>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
