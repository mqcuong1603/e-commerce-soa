import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ProductCard from "../ui/ProductCard";
import Button from "../ui/Button";

/**
 * ProductList component for displaying a grid of products with pagination and loading states
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of products to display
 * @param {Object} props.pagination - Pagination data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message if any
 * @param {Function} props.onPageChange - Callback when page is changed
 * @param {string} props.emptyMessage - Message to display when no products are found
 */
const ProductList = ({
  products,
  pagination,
  loading,
  error,
  onPageChange,
  emptyMessage,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Update current page when pagination changes
  useEffect(() => {
    if (pagination && pagination.page) {
      setCurrentPage(pagination.page);
    }
  }, [pagination]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (onPageChange) {
      onPageChange(page);
    }

    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Generate array of page numbers
  const getPageNumbers = () => {
    if (!pagination) return [];

    const { page, totalPages } = pagination;
    const pageNumbers = [];

    // Always show first page
    if (page > 3) {
      pageNumbers.push(1);
      if (page > 4) {
        pageNumbers.push("...");
      }
    }

    // Current page and neighbors
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    // Always show last page
    if (page < totalPages - 2) {
      if (page < totalPages - 3) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-[200px] flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-[200px] flex justify-center items-center">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-lg text-gray-500">
            {emptyMessage || "No products found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav
            className="inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {/* Previous page button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                pagination.hasPrevPage
                  ? "text-gray-500 hover:bg-gray-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((pageNumber, index) => (
              <React.Fragment key={index}>
                {pageNumber === "..." ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNumber === currentPage
                        ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next page button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                pagination.hasNextPage
                  ? "text-gray-500 hover:bg-gray-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}

      {/* Pagination info */}
      {pagination && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} products
        </div>
      )}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      brand: PropTypes.string.isRequired,
      description: PropTypes.string,
      shortDescription: PropTypes.string,
      basePrice: PropTypes.number,
      salePrice: PropTypes.number,
      averageRating: PropTypes.number,
      reviewCount: PropTypes.number,
      isNewProduct: PropTypes.bool,
      isBestSeller: PropTypes.bool,
      images: PropTypes.array,
      variants: PropTypes.array,
    })
  ),
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
    hasPrevPage: PropTypes.bool.isRequired,
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onPageChange: PropTypes.func,
  emptyMessage: PropTypes.string,
};

ProductList.defaultProps = {
  products: [],
  loading: false,
  error: "",
  emptyMessage: "No products found",
};

export default ProductList;
