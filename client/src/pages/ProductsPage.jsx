import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import productService from "../services/product.service";
import ProductList from "../components/product/ProductList";
import Sidebar from "../components/layout/Sidebar";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

/**
 * Products Page component
 * Displays products with filtering, sorting, and pagination options
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

  const [activeFilters, setActiveFilters] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availablePriceRanges, setAvailablePriceRanges] = useState([]);

  // Fetch products on component mount or when filters/sort/pagination change
  useEffect(() => {
    fetchProducts();
  }, [filters, sort, pagination.page]);

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

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    let field = "createdAt";
    let order = "desc";

    switch (value) {
      case "newest":
        field = "createdAt";
        order = "desc";
        break;
      case "oldest":
        field = "createdAt";
        order = "asc";
        break;
      case "priceAsc":
        field = "price";
        order = "asc";
        break;
      case "priceDesc":
        field = "price";
        order = "desc";
        break;
      case "nameAsc":
        field = "name";
        order = "asc";
        break;
      case "nameDesc":
        field = "name";
        order = "desc";
        break;
      case "rating":
        field = "averageRating";
        order = "desc";
        break;
      default:
        break;
    }

    setSort({ field, order });
    setPagination({ ...pagination, page: 1 }); // Reset to first page
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
    <div className="container mx-auto px-4 py-8">
      {/* Page title and breadcrumbs */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Products</h1>
        <div className="text-sm text-gray-500">
          <span>Home</span> &gt; <span className="text-gray-700">Products</span>
          {filters.category && (
            <>
              {" "}
              &gt; <span className="text-gray-700">{filters.category}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with filters */}
        <div className="w-full lg:w-1/4">
          <Sidebar className="sticky top-4" />
        </div>

        {/* Main content */}
        <div className="w-full lg:w-3/4">
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-gray-700">
                  Active Filters
                </h2>
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <div
                    key={index}
                    className="bg-white px-3 py-1 rounded-full border border-gray-300 flex items-center text-sm"
                  >
                    <span className="mr-2">{filter.label}</span>
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="text-gray-500 hover:text-gray-700"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort and count info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {products.length > 0
                  ? (pagination.page - 1) * pagination.limit + 1
                  : 0}
                -
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {pagination.total}
              </span>{" "}
              products
            </div>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm text-gray-600">
                Sort by:
              </label>
              <select
                id="sort"
                className="border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={getSortValue()}
                onChange={handleSortChange}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceAsc">Price Low to High</option>
                <option value="priceDesc">Price High to Low</option>
                <option value="nameAsc">Name A-Z</option>
                <option value="nameDesc">Name Z-A</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
              <button
                onClick={() => fetchProducts()}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Product list */}
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <Loader text="Loading products..." />
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
  );
};

export default ProductsPage;
