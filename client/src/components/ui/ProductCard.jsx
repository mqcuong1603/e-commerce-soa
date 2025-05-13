import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Product Card component for displaying product items in grid layouts
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
    <div
      className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white ${className}`}
    >
      {/* Discount badge */}
      {discount && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          -{discount}%
        </div>
      )}

      {/* "New" badge */}
      {product.isNewProduct && (
        <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
          NEW
        </div>
      )}

      {/* Product image */}
      <Link to={`/products/${product.slug}`}>
        <div className="relative pt-[100%]">
          {" "}
          {/* 1:1 aspect ratio */}
          {mainImage ? (
            <img
              src={mainImage.imageUrl}
              alt={mainImage.alt || product.name}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 uppercase mb-1">{product.brand}</p>

        {/* Product name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-medium mb-2 hover:text-primary-600 line-clamp-2 h-12">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.averageRating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline mt-2">
          {salePrice ? (
            <>
              <span className="text-lg font-bold text-red-600 mr-2">
                ₫{formatPrice(salePrice)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₫{formatPrice(regularPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ₫{formatPrice(regularPrice)}
            </span>
          )}
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
