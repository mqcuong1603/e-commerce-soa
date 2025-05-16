import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import productService from "../services/product.service";
import ProductList from "../components/product/ProductList";
import Sidebar from "../components/layout/Sidebar";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

/**
 * Elegant Products Page component
 * Features structured category navigation, beautiful filtering, and enhanced visual presentation
 */
const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // State for filters and sorting
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    search: searchParams.get("search") || "",
  });

  const [sort, setSort] = useState({
    field: searchParams.get("sortBy") || "createdAt",
    order: searchParams.get("order") || "desc",
  });

  const [sortOption, setSortOption] = useState(getSortValueFromParams());

  const [activeFilters, setActiveFilters] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availablePriceRanges, setAvailablePriceRanges] = useState([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState([]);
  const [categoryPath, setCategoryPath] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products on component mount or when filters/sort/pagination change
  useEffect(() => {
    fetchProducts();
  }, [filters, sort, pagination.page]);

  // Fetch category hierarchy on mount
  useEffect(() => {
    fetchCategoryHierarchy();
  }, []);

  // Update URL when filters or sort change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add filters to URL
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.search) params.set("search", filters.search);

    // Add sort to URL
    if (sort.field !== "createdAt") params.set("sortBy", sort.field);
    if (sort.order !== "desc") params.set("order", sort.order);

    // Add pagination to URL if not first page
    if (pagination.page > 1) params.set("page", pagination.page);

    // Update URL without reload
    const newUrl = `${location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.pushState({}, "", newUrl);
  }, [filters, sort, pagination.page, location.pathname]);

  // Update category path when category filter changes
  useEffect(() => {
    if (filters.category && categoryHierarchy.length > 0) {
      updateCategoryPath(filters.category);
    } else {
      setCategoryPath([]);
    }
  }, [filters.category, categoryHierarchy]);

  // Fetch category hierarchy
  const fetchCategoryHierarchy = async () => {
    try {
      const response = await productService.getCategoryTree();
      if (response.success) {
        setCategoryHierarchy(response.data || []);

        // If category is already set, update the path
        if (filters.category) {
          updateCategoryPath(filters.category);
        }
      }
    } catch (err) {
      console.error("Error fetching category hierarchy:", err);
    }
  };

  // Update the category path based on selected category
  const updateCategoryPath = (categorySlug) => {
    // This function would traverse the category hierarchy to find the path
    // For this example, we'll create a simple placeholder
    const findCategoryPath = (categories, slug, currentPath = []) => {
      for (const category of categories) {
        // Check if this is the category we're looking for
        if (category.slug === slug) {
          return [...currentPath, category];
        }

        // Check children if they exist
        if (category.children?.length) {
          const path = findCategoryPath(category.children, slug, [
            ...currentPath,
            category,
          ]);
          if (path) return path;
        }
      }
      return null;
    };

    const path = findCategoryPath(categoryHierarchy, categorySlug) || [];
    setCategoryPath(path);
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sort.field,
        order: sort.order,
        ...filters,
      };

      // Fetch products
      const response = await productService.getAllProducts(queryParams);

      if (response.success) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || pagination);

        // Extract available filters
        if (response.data.filters) {
          if (response.data.filters.brands) {
            setAvailableBrands(response.data.filters.brands);
          }
          if (response.data.filters.priceRanges) {
            setAvailablePriceRanges(response.data.filters.priceRanges);
          }
        }

        // Update active filters
        updateActiveFilters();
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

  // Update active filters
  const updateActiveFilters = () => {
    const active = [];

    if (filters.category) {
      active.push({
        type: "category",
        value: filters.category,
        label: `Category: ${filters.category}`,
      });
    }

    if (filters.brand) {
      active.push({
        type: "brand",
        value: filters.brand,
        label: `Brand: ${filters.brand}`,
      });
    }

    if (filters.minPrice) {
      active.push({
        type: "minPrice",
        value: filters.minPrice,
        label: `Min Price: ₫${Number(filters.minPrice).toLocaleString()}`,
      });
    }

    if (filters.maxPrice) {
      active.push({
        type: "maxPrice",
        value: filters.maxPrice,
        label: `Max Price: ₫${Number(filters.maxPrice).toLocaleString()}`,
      });
    }

    if (filters.search) {
      active.push({
        type: "search",
        value: filters.search,
        label: `Search: ${filters.search}`,
      });
    }

    setActiveFilters(active);
  };

  // Handle brand filter change
  const handleBrandFilter = (brand) => {
    setFilters({ ...filters, brand });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // Handle price range filter change
  const handlePriceRangeFilter = (minPrice, maxPrice) => {
    setFilters({ ...filters, minPrice, maxPrice });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // Handle category filter change
  const handleCategoryFilter = (category) => {
    setFilters({ ...filters, category });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // This converts the URL parameters to a sort option value when the page loads
  function getSortValueFromParams() {
    const field = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    if (field === "createdAt" && order === "desc") return "newest";
    if (field === "createdAt" && order === "asc") return "oldest";
    if (field === "price" && order === "asc") return "priceAsc";
    if (field === "price" && order === "desc") return "priceDesc";
    if (field === "name" && order === "asc") return "nameAsc";
    if (field === "name" && order === "desc") return "nameDesc";
    if (field === "averageRating" && order === "desc") return "rating";

    return "newest"; // Default
  }

  // Handle sort change
  const handleSortChange = (e) => {
    const selectedOption = e.target.value;
    setSortOption(selectedOption);

    // Update the sort state to match the selected option
    setSort({
      field: getSortField(selectedOption),
      order: getSortOrder(selectedOption),
    });

    // Reset to first page when changing sort
    setPagination({ ...pagination, page: 1 });
  };

  const getSortField = (option) => {
    switch (option) {
      case "newest":
        return "createdAt";
      case "oldest":
        return "createdAt";
      case "priceAsc":
      case "priceDesc":
        return "price"; // This is now correctly handled on server
      case "nameAsc":
      case "nameDesc":
        return "name";
      case "bestSelling":
        return "salesCount";
      case "rating":
        return "averageRating";
      default:
        return "createdAt";
    }
  };

  const getSortOrder = (option) => {
    switch (option) {
      case "oldest":
      case "priceAsc":
      case "nameAsc":
        return "asc";
      case "newest":
      case "priceDesc":
      case "nameDesc":
      case "bestSelling":
      case "rating":
        return "desc";
      default:
        return "desc";
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle filter removal
  const handleRemoveFilter = (filter) => {
    const newFilters = { ...filters };

    switch (filter.type) {
      case "category":
        newFilters.category = "";
        break;
      case "brand":
        newFilters.brand = "";
        break;
      case "minPrice":
        newFilters.minPrice = "";
        break;
      case "maxPrice":
        newFilters.maxPrice = "";
        break;
      case "search":
        newFilters.search = "";
        break;
      default:
        break;
    }

    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    });
    setSort({
      field: "createdAt",
      order: "desc",
    });
    setPagination({
      ...pagination,
      page: 1, // Reset to first page
    });
  };

  // Get sort option value based on field and order
  const getSortValue = () => {
    const { field, order } = sort;

    if (field === "createdAt" && order === "desc") return "newest";
    if (field === "createdAt" && order === "asc") return "oldest";
    if (field === "price" && order === "asc") return "priceAsc";
    if (field === "price" && order === "desc") return "priceDesc";
    if (field === "name" && order === "asc") return "nameAsc";
    if (field === "name" && order === "desc") return "nameDesc";
    if (field === "averageRating" && order === "desc") return "rating";

    return "newest"; // Default
  };

  return (
    <div className="container py-4">
      {/* Page header with elegant styling */}
      <div className="mb-4 pb-3 border-bottom">
        <h1 className="display-6 fw-bold mb-2">
          {filters.category
            ? categoryPath[categoryPath.length - 1]?.name || filters.category
            : "All Products"}
        </h1>

        {/* Enhanced breadcrumbs with path */}
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none">
                Products
              </Link>
            </li>

            {/* Render category path as breadcrumbs */}
            {categoryPath.map((cat, index) => (
              <li
                key={cat._id || index}
                className={`breadcrumb-item ${
                  index === categoryPath.length - 1 ? "active" : ""
                }`}
              >
                {index === categoryPath.length - 1 ? (
                  cat.name
                ) : (
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-decoration-none"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryFilter(cat.slug);
                    }}
                  >
                    {cat.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Category description if available */}
        {categoryPath.length > 0 &&
          categoryPath[categoryPath.length - 1]?.description && (
            <p className="text-muted mb-0">
              {categoryPath[categoryPath.length - 1].description}
            </p>
          )}
      </div>

      <div className="row g-4">
        {/* Mobile filter toggle button */}
        <div className="d-lg-none mb-3">
          <button
            className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <span>
              <i className="bi bi-funnel me-2"></i>
              Filters & Sorting
            </span>
            {activeFilters.length > 0 && (
              <span className="badge bg-danger rounded-pill">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Sidebar with elegant styling */}
        <div className="col-lg-3 d-none d-lg-block">
          <Sidebar
            className="shadow-sm rounded"
            priceRange={{
              min: filters.minPrice ? parseInt(filters.minPrice) : 0,
              max: filters.maxPrice ? parseInt(filters.maxPrice) : 100000000,
            }}
            selectedBrands={filters.brand ? [filters.brand] : []}
            onBrandChange={(brand, isChecked) => {
              handleBrandFilter(isChecked ? brand : "");
            }}
            onPriceRangeChange={handlePriceRangeFilter}
            onResetFilters={handleClearAllFilters}
          />
        </div>

        {/* Mobile filters offcanvas */}
        <div
          className={`offcanvas offcanvas-start ${
            showMobileFilters ? "show" : ""
          }`}
          tabIndex="-1"
          id="filterOffcanvas"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Filters & Sorting</h5>
            <button
              type="button"
              className="btn-close text-reset"
              onClick={() => setShowMobileFilters(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <Sidebar
              priceRange={{
                min: filters.minPrice ? parseInt(filters.minPrice) : 0,
                max: filters.maxPrice ? parseInt(filters.maxPrice) : 100000000,
              }}
              selectedBrands={filters.brand ? [filters.brand] : []}
              onBrandChange={(brand, isChecked) => {
                handleBrandFilter(isChecked ? brand : "");
              }}
              onPriceRangeChange={handlePriceRangeFilter}
              onResetFilters={handleClearAllFilters}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="col-lg-9">
          {/* Active filters with elegant styling */}
          {activeFilters.length > 0 && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold">Active Filters</h6>
                  <button
                    onClick={handleClearAllFilters}
                    className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear All
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <div
                      key={index}
                      className="badge bg-light text-dark border px-3 py-2 rounded-pill d-flex align-items-center"
                    >
                      <span className="me-2">{filter.label}</span>
                      <button
                        onClick={() => handleRemoveFilter(filter)}
                        className="btn-close btn-close-sm"
                        style={{ fontSize: "0.65rem" }}
                        aria-label="Remove filter"
                      ></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sort and count info with enhanced styling */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                <div className="text-muted">
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  Showing{" "}
                  <span className="fw-medium">
                    {products.length > 0
                      ? (pagination.page - 1) * pagination.limit + 1
                      : 0}{" "}
                    -{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="fw-medium">{pagination.total}</span>{" "}
                  products
                </div>
                <div className="d-flex align-items-center">
                  <label htmlFor="sort" className="me-2 text-muted mb-0">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    className="form-select form-select-sm"
                    value={getSortValue()}
                    onChange={handleSortChange}
                    style={{ minWidth: "180px" }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="nameAsc">Name: A to Z</option>
                    <option value="nameDesc">Name: Z to A</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error message with elegant styling */}
          {error && (
            <div
              className="alert alert-danger border-0 shadow-sm mb-4 rounded-3"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="bi bi-exclamation-triangle-fill fs-3"></i>
                </div>
                <div>
                  <h5 className="mb-1">Something went wrong</h5>
                  <p className="mb-2">{error}</p>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => fetchProducts()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Product list with elegant fade-in animation */}
          <div className="fade-in">
            {loading && products.length === 0 ? (
              <div
                className="d-flex justify-content-center align-items-center py-5"
                style={{ minHeight: "400px" }}
              >
                <div className="text-center">
                  <Loader
                    color="primary"
                    size="large"
                    text="Loading products..."
                    centered
                  />
                  <p className="text-muted mt-3 fst-italic">
                    Finding the best products for you...
                  </p>
                </div>
              </div>
            ) : (
              <ProductList
                products={products}
                pagination={pagination}
                loading={loading}
                error={error}
                onPageChange={handlePageChange}
                emptyMessage={
                  activeFilters.length > 0
                    ? "No products match your filters. Try adjusting or clearing them."
                    : "No products found."
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.4s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .offcanvas-backdrop {
          z-index: 1040;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
