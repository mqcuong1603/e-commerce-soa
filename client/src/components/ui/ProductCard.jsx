import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Rating from "./Rating";

/**
 * ProductCard component for displaying product items with Bootstrap styling
 */
const ProductCard = ({ product, className = "" }) => {
  // Calculate discount percentage if sale price exists
  const calculateDiscount = () => {
    if (
      product.salePrice &&
      product.basePrice &&
      product.salePrice < product.basePrice
    ) {
      const discount =
        ((product.basePrice - product.salePrice) / product.basePrice) * 100;
      return Math.round(discount);
    }
    return null;
  };

  const discount = calculateDiscount();

  // Get the first variant for price display and the main image
  const firstVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;
  const mainImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isMain) || product.images[0]
      : null;

  // Get the display price - either from variant or product base
  const regularPrice = firstVariant?.price || product.basePrice;
  const salePrice = firstVariant?.salePrice || product.salePrice;

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "";
  };

  return (
    <div className={`card h-100 product-card ${className}`}>
      {/* Product badges */}
      <div className="position-absolute top-0 start-0 p-2 z-index-1">
        {discount && <div className="badge bg-danger mb-1">-{discount}%</div>}
        {product.isNewProduct && (
          <div className="d-block badge bg-success">NEW</div>
        )}
      </div>

      {/* Product image */}
      <Link to={`/products/${product.slug}`} className="text-decoration-none">
        <div
          className="card-img-top position-relative overflow-hidden"
          style={{ minHeight: "200px" }}
        >
          {mainImage ? (
            <img
              src={mainImage.imageUrl}
              alt={mainImage.alt || product.name}
              className="img-fluid p-3"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "200px",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center bg-light h-100">
              <span className="text-muted">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product details */}
      <div className="card-body d-flex flex-column">
        {/* Brand */}
        <div className="text-muted small text-uppercase mb-1">
          {product.brand}
        </div>

        {/* Product name */}
        <Link to={`/products/${product.slug}`} className="text-decoration-none">
          <h6
            className="card-title product-title mb-2"
            style={{
              height: "40px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.name}
          </h6>
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <Rating
            value={product.averageRating || 0}
            size="small"
            count={product.reviewCount || 0}
            readOnly
          />
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="d-flex align-items-center">
            {salePrice ? (
              <>
                <div className="text-danger fw-bold me-2">
                  ₫{formatPrice(salePrice)}
                </div>
                <div className="text-muted small text-decoration-line-through">
                  ₫{formatPrice(regularPrice)}
                </div>
              </>
            ) : (
              <div className="fw-bold">₫{formatPrice(regularPrice)}</div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="d-grid gap-2 mt-3">
          <button className="btn btn-sm btn-outline-primary">
            <i className="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    basePrice: PropTypes.number,
    salePrice: PropTypes.number,
    isNewProduct: PropTypes.bool,
    isBestSeller: PropTypes.bool,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        salePrice: PropTypes.number,
      })
    ),
    images: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        imageUrl: PropTypes.string,
        isMain: PropTypes.bool,
        alt: PropTypes.string,
      })
    ),
  }).isRequired,
  className: PropTypes.string,
};

export default ProductCard;
