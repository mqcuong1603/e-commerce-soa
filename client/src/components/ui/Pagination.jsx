import React from "react";
import PropTypes from "prop-types";

/**
 * Pagination component using Bootstrap styling
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 12,
  onPageChange,
  showPageNumbers = true,
  showPageInfo = true,
  showFirstLastButtons = false,
  size = "medium",
  className = "",
}) => {
  // Calculate totalPages if it's not provided or incorrect
  const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectiveTotalPages = totalPages || calculatedTotalPages;

  // No need to render pagination if there's only 1 page
  if (effectiveTotalPages <= 1) {
    // Still render the info text if showPageInfo is true
    if (showPageInfo) {
      const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
      const endItem = Math.min(totalItems, currentPage * pageSize);

      return (
        <div
          className={`d-flex justify-content-between align-items-center ${className}`}
        >
          <div className="text-muted small">
            Showing {startItem} to {endItem} of {totalItems} items
          </div>
          <div>
            <span className="badge bg-secondary">Page 1 of 1</span>
          </div>
        </div>
      );
    }

    return null;
  }

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    // If we have 7 or fewer pages, show all
    if (effectiveTotalPages <= 7) {
      return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
    }

    // Otherwise, show first, last, current, and neighbors with ellipses
    const pages = [];

    // Always show first page
    pages.push(1);

    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push("...");
    }

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(effectiveTotalPages - 1, currentPage + 1);

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Show ellipsis if needed
    if (currentPage < effectiveTotalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (effectiveTotalPages > 1) {
      pages.push(effectiveTotalPages);
    }

    return pages;
  };

  // Map sizes to Bootstrap sizes
  const sizeClass =
    {
      small: "pagination-sm",
      medium: "", // default, no suffix in Bootstrap
      large: "pagination-lg",
    }[size] || "";

  // Calculate page information
  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={`${className}`}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
        {/* Page info */}
        {showPageInfo && (
          <div className="text-muted small mb-2 mb-md-0">
            Showing {startItem} to {endItem} of {totalItems} items
          </div>
        )}

        {/* Pagination */}
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            {/* Previous page button */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link text-primary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
            </li>

            {/* Page numbers */}
            {showPageNumbers &&
              getPageNumbers().map((pageNumber, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    pageNumber === currentPage ? "active" : ""
                  } ${pageNumber === "..." ? "disabled" : ""}`}
                >
                  <button
                    className={`page-link ${
                      currentPage === pageNumber
                        ? "bg-primary border-primary"
                        : "text-primary"
                    }`}
                    onClick={() => onPageChange(pageNumber)}
                    disabled={pageNumber === "..."}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}

            {/* Next page button */}
            <li
              className={`page-item ${
                currentPage === effectiveTotalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link text-primary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === effectiveTotalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile page selector */}
      <div className="d-md-none mt-2">
        <label className="form-label small text-muted mb-1">
          Jump to page:
        </label>
        <select
          className="form-select form-select-sm"
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          aria-label="Select page"
        >
          {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <option key={pageNum} value={pageNum}>
                Page {pageNum} of {effectiveTotalPages}
              </option>
            )
          )}
        </select>
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
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
};

export default Pagination;
