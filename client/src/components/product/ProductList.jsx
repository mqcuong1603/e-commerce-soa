import React from "react";
import PropTypes from "prop-types";
import ProductCard from "../ui/ProductCard";
import Pagination from "../ui/Pagination";
import Loader from "../ui/Loader";

/**
 * ProductList component for displaying a grid of products with enhanced styling
 * Features elegant transitions, improved visual states, and responsive layout
 */
const ProductList = ({
  products,
  pagination,
  loading,
  error,
  onPageChange,
  emptyMessage,
}) => {
  // Render loading state with enhanced visual appeal
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-40 py-5">
        <div className="text-center">
          <Loader size="large" text="Loading products..." centered />
          <p className="text-muted mt-3 fst-italic">
            Preparing your shopping experience...
          </p>
        </div>
      </div>
    );
  }

  // Render error state with elegant styling
  if (error) {
    return (
      <div
        className="alert alert-danger border-0 shadow-sm p-4 text-center rounded-3"
        role="alert"
      >
        <div className="mb-3">
          <i className="bi bi-exclamation-triangle-fill display-5 text-danger opacity-75"></i>
        </div>
        <h4 className="alert-heading mb-3">Error Loading Products</h4>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-danger px-4 py-2"
        >
          <i className="bi bi-arrow-clockwise me-2"></i> Try Again
        </button>
      </div>
    );
  }

  // Render empty state with beautiful styling
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5 my-4">
        <div className="mb-4">
          <div className="d-inline-block p-3 bg-light rounded-circle mb-3">
            <i className="bi bi-search display-4 text-secondary"></i>
          </div>
        </div>
        <h4 className="text-muted mb-3">
          {emptyMessage || "No products found"}
        </h4>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "500px" }}>
          We couldn't find any products matching your criteria. Try adjusting
          your filters or browse our other categories.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline-secondary px-4"
          >
            <i className="bi bi-arrow-left me-2"></i> Go Back
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn btn-primary px-4"
          >
            <i className="bi bi-house me-2"></i> Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Products grid with fading transition effect */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4 product-grid">
        {products.map((product, index) => (
          <div
            key={product._id}
            className="col product-item"
            style={{
              animation: `fadeInUp 0.4s ease-out forwards`,
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Product count summary */}
      {pagination && (
        <div className="d-flex justify-content-center mt-4">
          <div className="badge bg-light text-dark border px-3 py-2 shadow-sm rounded-pill">
            <i className="bi bi-box-seam me-2"></i>
            Showing <span className="fw-bold">{products.length}</span> of{" "}
            <span className="fw-bold">{pagination.total}</span> products
          </div>
        </div>
      )}

      {/* Enhanced pagination */}
      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page || 1}
            totalPages={Math.ceil(
              (pagination.total || 0) / (pagination.limit || 12)
            )}
            totalItems={pagination.total || 0}
            pageSize={pagination.limit || 12}
            onPageChange={onPageChange}
            showFirstLastButtons
          />
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-grid {
          position: relative;
        }

        .product-item {
          transition: transform 0.3s ease;
        }
      `}</style>
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
