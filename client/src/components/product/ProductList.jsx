import React from "react";
import PropTypes from "prop-types";
import ProductCard from "../ui/ProductCard";
import Pagination from "../ui/Pagination";
import Loader from "../ui/Loader";

/**
 * ProductList component for displaying a grid of products with Bootstrap styling
 */
const ProductList = ({
  products,
  pagination,
  loading,
  error,
  onPageChange,
  emptyMessage,
}) => {
  // Render loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-40 py-5">
        <Loader size="large" text="Loading products..." centered />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="alert alert-danger p-4 text-center" role="alert">
        <h4 className="alert-heading mb-3">Error Loading Products</h4>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline-danger mt-3"
        >
          <i className="bi bi-arrow-clockwise me-2"></i> Try Again
        </button>
      </div>
    );
  }

  // Render empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-search display-1 text-muted mb-3"></i>
        <h4 className="text-muted mb-3">
          {emptyMessage || "No products found"}
        </h4>
        <button
          onClick={() => window.history.back()}
          className="btn btn-outline-primary"
        >
          <i className="bi bi-arrow-left me-2"></i> Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Products grid */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4">
        {products.map((product) => (
          <div key={product._id} className="col">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={onPageChange}
            showFirstLastButtons
          />
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
