import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import productService from "../../services/product.service";
import PropTypes from "prop-types";

/**
 * Elegant Sidebar component with beautiful styling and enhanced category hierarchy
 * Displays categories in a hierarchical tree with expandable sections
 */
const Sidebar = ({
  className = "",
  priceRange,
  selectedBrands = [],
  onBrandChange,
  onPriceRangeChange,
  onResetFilters,
  category,
  onClose,
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localPriceRange, setLocalPriceRange] = useState(
    priceRange || { min: 0, max: 100000000 }
  );
  const [expandedCategories, setExpandedCategories] = useState({});
  const [popularBrands, setPopularBrands] = useState([
    { id: "dell", name: "Dell" },
    { id: "hp", name: "HP" },
    { id: "asus", name: "ASUS" },
    { id: "lenovo", name: "Lenovo" },
    { id: "msi", name: "MSI" },
    { id: "acer", name: "Acer" },
    { id: "apple", name: "Apple" },
    { id: "samsung", name: "Samsung" },
  ]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Fetch categories for sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await productService.getCategoryTree();
        if (response.success) {
          setCategories(response.data || []);

          // If there's a current category, expand its parent categories
          if (category) {
            expandCategoryPath(response.data, category.slug);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [category]);

  // Update local price range when prop changes
  useEffect(() => {
    if (priceRange) {
      setLocalPriceRange(priceRange);
    }
  }, [priceRange]);

  // Expand all parent categories of the current category
  const expandCategoryPath = (allCategories, targetSlug) => {
    const newExpanded = { ...expandedCategories };

    // Function to search and expand parent categories
    const findAndExpandParents = (categories, target) => {
      for (const cat of categories) {
        if (cat.slug === target) {
          return true;
        }

        if (cat.children && cat.children.length > 0) {
          if (findAndExpandParents(cat.children, target)) {
            newExpanded[cat._id] = true;
            return true;
          }
        }
      }
      return false;
    };

    findAndExpandParents(allCategories, targetSlug);
    setExpandedCategories(newExpanded);
  };

  // Toggle category expansion with smooth animation
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle price range input
  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setLocalPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Apply price filter
  const applyPriceFilter = () => {
    if (onPriceRangeChange) {
      onPriceRangeChange(localPriceRange.min, localPriceRange.max);
      if (onClose) onClose();
    } else {
      // Legacy behavior for standalone sidebar
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("minPrice", localPriceRange.min);
      searchParams.set("maxPrice", localPriceRange.max);
      window.location.href = `/products?${searchParams.toString()}`;
    }
  };

  // Reset price filter
  const resetPriceFilter = () => {
    const resetRange = { min: 0, max: 100000000 };
    setLocalPriceRange(resetRange);

    if (onPriceRangeChange) {
      onPriceRangeChange(resetRange.min, resetRange.max);
    } else {
      // Legacy behavior for standalone sidebar
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("minPrice");
      searchParams.delete("maxPrice");
      window.location.href = `/products?${searchParams.toString()}`;
    }
  };

  // Handle brand checkbox change
  const handleBrandChange = (brand, isChecked) => {
    if (onBrandChange) {
      onBrandChange(brand, isChecked);
    }
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Reset all filters
  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
      if (onClose) onClose();
    }
  };

  // Get appropriate icon based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes("laptop")) return "bi-laptop";
    if (name.includes("pc") || name.includes("desktop")) return "bi-pc-display";
    if (name.includes("monitor")) return "bi-display";
    if (name.includes("phone") || name.includes("mobile")) return "bi-phone";
    if (name.includes("tablet")) return "bi-tablet";
    if (name.includes("accessory") || name.includes("accessories"))
      return "bi-headphones";
    if (name.includes("component")) return "bi-cpu";
    if (name.includes("printer")) return "bi-printer";
    if (name.includes("camera")) return "bi-camera";
    if (name.includes("game") || name.includes("gaming"))
      return "bi-controller";
    if (name.includes("network")) return "bi-router";
    if (name.includes("storage")) return "bi-hdd";
    return "bi-tag";
  };

  // Render category with proper hierarchy and indentation
  const renderCategoryTree = () => {
    if (!categories || categories.length === 0) {
      return <p className="text-muted small">No categories available</p>;
    }

    return (
      <div className="category-tree">
        {categories.map((parentCategory) => (
          <div key={parentCategory._id} className="category-parent mb-3">
            {/* Parent category with icon */}
            <div className="d-flex align-items-center parent-category-header">
              <div
                className={`category-icon-wrapper ${
                  expandedCategories[parentCategory._id] ? "expanded" : ""
                }`}
                onClick={() => toggleCategory(parentCategory._id)}
              >
                <i
                  className={`category-toggle-icon bi ${
                    expandedCategories[parentCategory._id]
                      ? "bi-dash"
                      : "bi-plus"
                  }`}
                ></i>
              </div>

              <Link
                to={`/category/${parentCategory.slug}`}
                className={`parent-category-link ${
                  location.pathname === `/category/${parentCategory.slug}`
                    ? "active"
                    : ""
                }`}
                onClick={onClose}
              >
                <i
                  className={`category-icon bi ${getCategoryIcon(
                    parentCategory.name
                  )} me-2`}
                ></i>
                <span>{parentCategory.name}</span>
                {parentCategory.productCount > 0 && (
                  <span className="category-count">
                    {parentCategory.productCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Children categories with proper visual nesting */}
            {parentCategory.children && parentCategory.children.length > 0 && (
              <div
                className={`subcategory-container ${
                  expandedCategories[parentCategory._id] ? "show" : "hide"
                }`}
              >
                {expandedCategories[parentCategory._id] &&
                  parentCategory.children.map((childCategory) => (
                    <div key={childCategory._id} className="category-child">
                      <div className="subcategory-line"></div>
                      <Link
                        to={`/category/${childCategory.slug}`}
                        className={`child-category-link ${
                          location.pathname ===
                          `/category/${childCategory.slug}`
                            ? "active"
                            : ""
                        }`}
                        onClick={onClose}
                      >
                        <span>{childCategory.name}</span>
                        {childCategory.productCount > 0 && (
                          <span className="category-count">
                            {childCategory.productCount}
                          </span>
                        )}
                      </Link>

                      {/* Third level categories - if needed */}
                      {childCategory.children &&
                        childCategory.children.length > 0 && (
                          <div className="grandchild-categories">
                            {childCategory.children.map((grandchild) => (
                              <Link
                                key={grandchild._id}
                                to={`/category/${grandchild.slug}`}
                                className={`grandchild-category-link ${
                                  location.pathname ===
                                  `/category/${grandchild.slug}`
                                    ? "active"
                                    : ""
                                }`}
                                onClick={onClose}
                              >
                                <span>{grandchild.name}</span>
                                {grandchild.productCount > 0 && (
                                  <span className="category-count">
                                    {grandchild.productCount}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get display brands based on show all toggle
  const displayBrands = showAllBrands
    ? popularBrands
    : popularBrands.slice(0, 5);

  // Add CSS for enhanced tree styling
  const categoryStyles = `
    .category-tree {
      margin-left: -5px;
    }
    
    /* Parent category styling */
    .parent-category-header {
      position: relative;
    }
    
    .category-icon-wrapper {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      margin-right: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .category-icon-wrapper:hover {
      background-color: rgba(220, 53, 69, 0.1);
      border-color: rgba(220, 53, 69, 0.5);
    }
    
    .category-icon-wrapper.expanded {
      background-color: rgba(220, 53, 69, 0.15);
      border-color: rgba(220, 53, 69, 0.5);
    }
    
    .category-toggle-icon {
      font-size: 14px;
      color: #6c757d;
      transition: all 0.2s;
    }
    
    .expanded .category-toggle-icon {
      color: #dc3545;
    }
    
    .parent-category-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #212529;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 4px;
      transition: all 0.2s;
      flex-grow: 1;
    }
    
    .parent-category-link:hover {
      background-color: rgba(220, 53, 69, 0.08);
    }
    
    .parent-category-link.active {
      background-color: rgba(220, 53, 69, 0.12);
      color: #dc3545;
    }
    
    .category-icon {
      color: #6c757d;
    }
    
    .parent-category-link.active .category-icon {
      color: #dc3545;
    }
    
    .category-count {
      display: inline-block;
      margin-left: 8px;
      font-size: 0.75rem;
      background-color: #f8f9fa;
      color: #6c757d;
      padding: 0px 6px;
      border-radius: 10px;
      border: 1px solid #dee2e6;
    }
    
    /* Subcategory container and visual tree lines */
    .subcategory-container {
      margin-left: 16px;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: all 0.3s ease-out;
    }
    
    .subcategory-container.show {
      max-height: 1000px;
      opacity: 1;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    
    .category-child {
      position: relative;
      margin-left: 15px;
      padding-bottom: 2px;
    }
    
    .subcategory-line {
      position: absolute;
      left: -15px;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: #dee2e6;
    }
    
    .category-child:last-child .subcategory-line {
      height: 15px;
    }
    
    .child-category-link {
      position: relative;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #495057;
      padding: 6px 12px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .child-category-link:before {
      content: "";
      position: absolute;
      left: -15px;
      top: 50%;
      width: 12px;
      height: 1px;
      background-color: #dee2e6;
    }
    
    .child-category-link:hover {
      background-color: rgba(220, 53, 69, 0.05);
      color: #dc3545;
    }
    
    .child-category-link.active {
      background-color: rgba(220, 53, 69, 0.08);
      color: #dc3545;
      font-weight: 500;
    }
    
    /* Third level categories */
    .grandchild-categories {
      margin-left: 12px;
      border-left: 1px dashed #dee2e6;
      margin-top: 2px;
    }
    
    .grandchild-category-link {
      position: relative;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: #6c757d;
      font-size: 0.85rem;
      padding: 4px 12px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .grandchild-category-link:before {
      content: "";
      position: absolute;
      left: -6px;
      top: 50%;
      width: 6px;
      height: 1px;
      background-color: #dee2e6;
    }
    
    .grandchild-category-link:hover {
      background-color: rgba(220, 53, 69, 0.05);
      color: #dc3545;
    }
    
    .grandchild-category-link.active {
      background-color: rgba(220, 53, 69, 0.08);
      color: #dc3545;
      font-weight: 500;
    }
  `;

  return (
    <>
      <style>{categoryStyles}</style>
      <div className={`shadow-sm rounded ${className}`}>
        {/* Filter actions and reset */}
        {onResetFilters && (
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Filters</h5>
            <button
              className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
              onClick={handleResetFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>
              Reset All
            </button>
          </div>
        )}

        {/* Categories Section with visually enhanced hierarchy */}
        <div className="p-3">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-grid me-2 text-danger"></i>
            Categories
          </h5>

          {loading ? (
            <div className="text-center py-3">
              <div
                className="spinner-border spinner-border-sm text-danger"
                role="status"
              >
                <span className="visually-hidden">Loading categories...</span>
              </div>
              <p className="text-muted mt-2 mb-0 small">
                Loading categories...
              </p>
            </div>
          ) : (
            <div className="categories-container pt-1">
              {renderCategoryTree()}
            </div>
          )}
        </div>

        {/* Price Filter with elegant range inputs */}
        <div className="p-3 border-top">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-cash-stack me-2 text-danger"></i>
            Price Range
          </h5>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label
                htmlFor="minPrice"
                className="form-label text-muted mb-0 small"
              >
                Min Price
              </label>
              <span className="badge bg-light text-dark border">
                ₫{formatPrice(localPriceRange.min)}
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              id="minPrice"
              min="0"
              max="50000000"
              step="1000000"
              value={localPriceRange.min}
              onChange={(e) => handlePriceChange(e, "min")}
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label
                htmlFor="maxPrice"
                className="form-label text-muted mb-0 small"
              >
                Max Price
              </label>
              <span className="badge bg-light text-dark border">
                ₫{formatPrice(localPriceRange.max)}
              </span>
            </div>
            <input
              type="range"
              className="form-range"
              id="maxPrice"
              min="0"
              max="100000000"
              step="1000000"
              value={localPriceRange.max}
              onChange={(e) => handlePriceChange(e, "max")}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={applyPriceFilter}
              className="btn btn-sm btn-danger flex-grow-1"
            >
              <i className="bi bi-check2-circle me-1"></i>
              Apply
            </button>
            <button
              onClick={resetPriceFilter}
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        {/* Popular Brands with elegant checkboxes */}
        <div className="p-3 border-top">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-tag me-2 text-danger"></i>
            Popular Brands
          </h5>

          <div className="brand-checkboxes">
            {displayBrands.map((brand) => (
              <div
                className="form-check d-flex align-items-center mb-2"
                key={brand.id}
              >
                <input
                  className="form-check-input border-danger"
                  type="checkbox"
                  id={`brand-${brand.id}`}
                  checked={selectedBrands?.includes(brand.id) || false}
                  onChange={(e) =>
                    handleBrandChange(brand.id, e.target.checked)
                  }
                />
                <label
                  className="form-check-label ms-2 user-select-none"
                  htmlFor={`brand-${brand.id}`}
                  style={{ cursor: "pointer" }}
                >
                  {brand.name}
                </label>
              </div>
            ))}
          </div>

          {popularBrands.length > 5 && (
            <button
              className="btn btn-link btn-sm text-decoration-none mt-1 px-0"
              onClick={() => setShowAllBrands(!showAllBrands)}
            >
              <i
                className={`bi ${
                  showAllBrands ? "bi-chevron-up" : "bi-chevron-down"
                } me-1`}
              ></i>
              {showAllBrands ? "Show Less" : "Show All Brands"}
            </button>
          )}
        </div>

        {/* Customer Service with elegant icons - compact version */}
        <div className="p-3 border-top">
          <h5 className="fw-bold mb-3 d-flex align-items-center">
            <i className="bi bi-headset me-2 text-danger"></i>
            Customer Service
          </h5>

          <div className="row g-2">
            <div className="col-6">
              <Link
                to="/contact"
                className="btn btn-sm btn-outline-secondary w-100 text-start"
              >
                <i className="bi bi-telephone me-2"></i>
                Contact
              </Link>
            </div>
            <div className="col-6">
              <Link
                to="/faq"
                className="btn btn-sm btn-outline-secondary w-100 text-start"
              >
                <i className="bi bi-question-circle me-2"></i>
                FAQs
              </Link>
            </div>
            <div className="col-6">
              <Link
                to="/shipping-policy"
                className="btn btn-sm btn-outline-secondary w-100 text-start"
              >
                <i className="bi bi-truck me-2"></i>
                Shipping
              </Link>
            </div>
            <div className="col-6">
              <Link
                to="/returns"
                className="btn btn-sm btn-outline-secondary w-100 text-start"
              >
                <i className="bi bi-arrow-return-left me-2"></i>
                Returns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  priceRange: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
  }),
  selectedBrands: PropTypes.array,
  onBrandChange: PropTypes.func,
  onPriceRangeChange: PropTypes.func,
  onResetFilters: PropTypes.func,
  category: PropTypes.object,
  onClose: PropTypes.func,
};

export default Sidebar;
