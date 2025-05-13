import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Pagination component for navigating through multi-page content
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageChange - Callback when page is changed
 * @param {boolean} props.showPageNumbers - Whether to show page numbers
 * @param {boolean} props.showPageInfo - Whether to show page info text
 * @param {boolean} props.showFirstLastButtons - Whether to show first/last page buttons
 * @param {string} props.variant - Visual style variant ('simple', 'rounded', 'buttons')
 * @param {string} props.size - Size of pagination buttons ('small', 'medium', 'large')
 * @param {string} props.className - Additional CSS classes
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showPageNumbers = true,
  showPageInfo = true,
  showFirstLastButtons = false,
  variant = "simple",
  size = "medium",
  className = "",
}) => {
  const [page, setPage] = useState(currentPage);

  // Update internal state when props change
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    // Don't do anything if the requested page is invalid
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setPage(newPage);

    if (onPageChange) {
      onPageChange(newPage);
    }

    // Optionally scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    // If we have 7 or fewer pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Otherwise, show first, last, current, and neighbors with ellipses
    const pages = [];

    // Always show first page
    pages.push(1);

    // Show ellipsis if needed
    if (page > 3) {
      pages.push("...");
    }

    // Calculate range around current page
    const rangeStart = Math.max(2, page - 1);
    const rangeEnd = Math.min(totalPages - 1, page + 1);

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Show ellipsis if needed
    if (page < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Calculate starting and ending item numbers
  const startItem = Math.min(totalItems, (page - 1) * pageSize + 1);
  const endItem = Math.min(totalItems, page * pageSize);

  // Size classes
  const sizeClasses = {
    small: {
      button: "h-8 w-8 text-sm",
      text: "px-2 py-1 text-sm",
    },
    medium: {
      button: "h-10 w-10 text-base",
      text: "px-3 py-2 text-base",
    },
    large: {
      button: "h-12 w-12 text-lg",
      text: "px-4 py-3 text-lg",
    },
  };

  // Variant classes
  const getVariantClasses = (isActive, isDisabled) => {
    const baseClasses = "flex items-center justify-center focus:outline-none";
    const disabledClasses = isDisabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer";

    switch (variant) {
      case "rounded":
        return `${baseClasses} ${disabledClasses} ${
          isActive
            ? "bg-primary-600 text-white hover:bg-primary-700 rounded-full"
            : "text-gray-700 hover:bg-gray-100 rounded-full"
        }`;
      case "buttons":
        return `${baseClasses} ${disabledClasses} border ${
          isActive
            ? "bg-primary-600 border-primary-600 text-white hover:bg-primary-700"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`;
      case "simple":
      default:
        return `${baseClasses} ${disabledClasses} ${
          isActive
            ? "bg-primary-50 border-primary-500 text-primary-600 z-10"
            : "border-gray-300 text-gray-500 hover:bg-gray-50"
        }`;
    }
  };

  // If there's only 1 page, don't render pagination unless showSinglePage is true
  if (totalPages <= 1) {
    // Still render the info text if showPageInfo is true
    if (showPageInfo) {
      return (
        <div className={`flex justify-between items-center ${className}`}>
          <div className="text-sm text-gray-500">
            Showing {startItem} to {endItem} of {totalItems} items
          </div>
          <div className="flex">
            <span
              className={`border ${sizeClasses[size].text} border-gray-300 bg-gray-100 text-gray-400 rounded-md`}
            >
              Page 1 of 1
            </span>
          </div>
        </div>
      );
    }

    return null;
  }

  // Get page numbers to display
  const pageNumbers = showPageNumbers ? getPageNumbers() : [];

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 ${className}`}
    >
      {/* Page info text */}
      {showPageInfo && (
        <div className="text-sm text-gray-500">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}

      {/* Pagination buttons */}
      <div className="flex items-center">
        {/* First page button */}
        {showFirstLastButtons && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className={`${getVariantClasses(false, page === 1)} ${
              sizeClasses[size].button
            } rounded-l-md`}
            aria-label="First page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`${getVariantClasses(false, page === 1)} ${
            sizeClasses[size].button
          } ${!showFirstLastButtons ? "rounded-l-md" : ""}`}
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {showPageNumbers &&
          pageNumbers.map((pageNumber, index) => (
            <React.Fragment key={index}>
              {pageNumber === "..." ? (
                <span
                  className={`${getVariantClasses(false, true)} ${
                    sizeClasses[size].button
                  }`}
                >
                  ...
                </span>
              ) : (
                <button
                  onClick={() => handlePageChange(pageNumber)}
                  className={`${getVariantClasses(
                    pageNumber === page,
                    false
                  )} ${sizeClasses[size].button}`}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              )}
            </React.Fragment>
          ))}

        {/* Next page button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`${getVariantClasses(false, page === totalPages)} ${
            sizeClasses[size].button
          } ${!showFirstLastButtons ? "rounded-r-md" : ""}`}
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Last page button */}
        {showFirstLastButtons && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className={`${getVariantClasses(false, page === totalPages)} ${
              sizeClasses[size].button
            } rounded-r-md`}
            aria-label="Last page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Page selector for mobile (simple dropdown-like appearance) */}
        <div className="sm:hidden ml-4">
          <select
            className="border border-gray-300 rounded-md text-gray-700 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={page}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            aria-label="Select page"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <option key={pageNum} value={pageNum}>
                  Page {pageNum}
                </option>
              )
            )}
          </select>
        </div>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showPageNumbers: PropTypes.bool,
  showPageInfo: PropTypes.bool,
  showFirstLastButtons: PropTypes.bool,
  variant: PropTypes.oneOf(["simple", "rounded", "buttons"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
};

export default Pagination;
