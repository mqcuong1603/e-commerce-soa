import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import productService from "../services/product.service";
import ProductList from "../components/product/ProductList";
import Sidebar from "../components/layout/Sidebar";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";

/**
 * CategoryPage component displays products from a specific category
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
        sort: sortOption,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      };

      // Add brands filter if selected
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

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    // Reset to page 1 when changing sort
    setPagination({ ...pagination, page: 1 });
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category header */}
      {category && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600">{category.description}</p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button
            onClick={fetchCategoryData}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4">
          {/* Sort and filter options */}
          <Card className="mb-6 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  {products.length > 0
                    ? (pagination.page - 1) * pagination.limit + 1
                    : 0}
                  -
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} products
                </p>
              </div>

              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="nameAsc">Name: A to Z</option>
                  <option value="nameDesc">Name: Z to A</option>
                  <option value="bestSelling">Best Selling</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Product list */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader color="primary" text="Loading products..." />
            </div>
          ) : (
            <ProductList
              products={products}
              pagination={pagination}
              onPageChange={handlePageChange}
              emptyMessage={`No products found in the "${
                category?.name || ""
              }" category. Try adjusting your filters.`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
