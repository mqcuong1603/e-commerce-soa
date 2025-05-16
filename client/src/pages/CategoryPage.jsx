import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import productService from "../services/product.service";
import ProductList from "../components/product/ProductList";
import Sidebar from "../components/layout/Sidebar";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

/**
 * CategoryPage component displays products from a specific category
 * with elegant styling, smooth transitions, and enhanced user experience
 */
const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Filter and sort state
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "newest"
  );
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get("minPrice") || "0"),
    max: parseInt(searchParams.get("maxPrice") || "100000000"),
  });
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get("brands") ? searchParams.get("brands").split(",") : []
  );
  const [filterCount, setFilterCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch category data and products on mount or when params change
  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  // Fetch products when filters, sort, or pagination changes
  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [slug, pagination.page, sortOption, priceRange, selectedBrands]);

  // Update URL search params when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    if (pagination.page > 1) {
      newSearchParams.set("page", pagination.page.toString());
    }

    if (sortOption && sortOption !== "newest") {
      newSearchParams.set("sort", sortOption);
    }

    if (priceRange.min > 0) {
      newSearchParams.set("minPrice", priceRange.min.toString());
    }

    if (priceRange.max < 100000000) {
      newSearchParams.set("maxPrice", priceRange.max.toString());
    }

    if (selectedBrands.length > 0) {
      newSearchParams.set("brands", selectedBrands.join(","));
    }

    setSearchParams(newSearchParams);

    // Count active filters
    let count = 0;
    if (priceRange.min > 0 || priceRange.max < 100000000) count++;
    if (selectedBrands.length > 0) count++;
    if (sortOption && sortOption !== "newest") count++;
    setFilterCount(count);
  }, [pagination.page, sortOption, priceRange, selectedBrands]);

  // Fetch category data
  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getCategoryBySlug(slug);

      if (response.success) {
        setCategory(response.data);
        // After getting category, fetch products
        fetchProducts();
      } else {
        throw new Error(response.message || "Failed to fetch category");
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      setError("Failed to load category. Please try again.");
      setLoading(false);
    }
  };

  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Prepare query params
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        // Replace single sort parameter with sortBy and order
        sortBy: getSortField(sortOption),
        order: getSortOrder(sortOption),
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      };

      // If brands exist in the filter
      if (selectedBrands.length > 0) {
        params.brands = selectedBrands.join(",");
      }

      const response = await productService.getProductsByCategory(slug, params);

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

  // Helper function to convert sort option to field
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

  // Helper function to convert sort option to order direction
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
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);

    // Reset to page 1 when changing sort
    setPagination({ ...pagination, page: 1 });

    // Update URL parameters to include the sort
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSortOption);
    setSearchParams(params);
  };

  // Handle brand selection
  const handleBrandChange = (brand, isChecked) => {
    let newBrands = [...selectedBrands];

    if (isChecked) {
      newBrands.push(brand);
    } else {
      newBrands = newBrands.filter((item) => item !== brand);
    }

    setSelectedBrands(newBrands);
    // Reset to page 1 when changing brands
    setPagination({ ...pagination, page: 1 });
  };

  // Handle price range change
  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
    // Reset to page 1 when changing price range
    setPagination({ ...pagination, page: 1 });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSortOption("newest");
    setPriceRange({ min: 0, max: 100000000 });
    setSelectedBrands([]);
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/categories" className="text-decoration-none">
              Categories
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {category?.name || "Loading..."}
          </li>
        </ol>
      </nav>

      {/* Category header with beautiful styling */}
      {category && (
        <div className="mb-4 py-3 border-bottom">
          <h1 className="display-6 fw-bold mb-2">
            {category.name}
            {category.productCount && (
              <span className="ms-2 fs-5 fw-normal text-muted">
                ({category.productCount} products)
              </span>
            )}
          </h1>
          {category.description && (
            <p className="text-muted lead mb-0">{category.description}</p>
          )}
        </div>
      )}

      {/* Elegant error message */}
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
              <Button variant="danger" size="small" onClick={fetchCategoryData}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Sidebar with filters - hidden on mobile, shown in offcanvas */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="position-sticky" style={{ top: "1rem" }}>
            <Sidebar
              priceRange={priceRange}
              selectedBrands={selectedBrands}
              onBrandChange={handleBrandChange}
              onPriceRangeChange={handlePriceRangeChange}
              category={category}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>

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
            {filterCount > 0 && (
              <span className="badge bg-danger rounded-pill">
                {filterCount}
              </span>
            )}
          </button>
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
              priceRange={priceRange}
              selectedBrands={selectedBrands}
              onBrandChange={handleBrandChange}
              onPriceRangeChange={handlePriceRangeChange}
              category={category}
              onResetFilters={handleResetFilters}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>

        {/* Main content area with elegant styling */}
        <div className="col-lg-9">
          {/* Sort and filter options */}
          <Card className="mb-4 border-0 shadow-sm">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3">
              <div className="mb-3 mb-sm-0">
                {!loading && products.length > 0 && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-grid me-2 text-muted"></i>
                    <p className="text-muted mb-0">
                      Showing{" "}
                      <span className="fw-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>
                      -
                      <span className="fw-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="fw-medium">{pagination.total}</span>{" "}
                      products
                    </p>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center">
                <label
                  htmlFor="sort"
                  className="form-label text-muted me-2 mb-0"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="form-select form-select-sm"
                  style={{ minWidth: "180px" }}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="nameAsc">Name: A to Z</option>
                  <option value="nameDesc">Name: Z to A</option>
                  <option value="bestSelling">Best Selling</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Active filters display */}
            {filterCount > 0 && (
              <div className="px-3 pb-3">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <small className="text-muted me-1">Active filters:</small>

                  {selectedBrands.length > 0 && (
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-tag me-1"></i>
                        <span>
                          {selectedBrands.length} brand
                          {selectedBrands.length > 1 ? "s" : ""}
                        </span>
                        <button
                          className="btn btn-sm p-0 ms-2 text-danger"
                          onClick={() => setSelectedBrands([])}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </span>
                    </span>
                  )}

                  {(priceRange.min > 0 || priceRange.max < 100000000) && (
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-cash-stack me-1"></i>
                        <span>Price range</span>
                        <button
                          className="btn btn-sm p-0 ms-2 text-danger"
                          onClick={() =>
                            setPriceRange({ min: 0, max: 100000000 })
                          }
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </span>
                    </span>
                  )}

                  {sortOption && sortOption !== "newest" && (
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-sort me-1"></i>
                        <span>Sorted by: {sortOption}</span>
                        <button
                          className="btn btn-sm p-0 ms-2 text-danger"
                          onClick={() => setSortOption("newest")}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </span>
                    </span>
                  )}

                  <button
                    className="btn btn-sm btn-outline-secondary rounded-pill ms-auto"
                    onClick={handleResetFilters}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Reset all
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Product list with loading state */}
          {loading ? (
            <div className="text-center py-5 my-4">
              <Loader color="primary" text="Loading products..." centered />
              <p className="text-muted mt-3">
                Finding the best products for you...
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <ProductList
                products={products}
                pagination={pagination}
                onPageChange={handlePageChange}
                emptyMessage={`No products found in the "${
                  category?.name || ""
                }" category. Try adjusting your filters.`}
              />
            </div>
          )}
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

        /* Custom overlay for mobile filters */
        .offcanvas-backdrop {
          z-index: 1040;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;
