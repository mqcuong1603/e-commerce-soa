import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import Rating from "./Rating";
import { toast } from "react-toastify";

/**
 * Enhanced ProductCard component with improved cart interactions
 * Features vibrant colors, elegant hover effects, and improved visual hierarchy
 * Fixed badge positioning and functional add-to-cart button with inventory check
 */
const ProductCard = ({ product, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

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

  // Get inventory level - check first variant if available
  const inventory = firstVariant
    ? firstVariant.inventory
    : product.inventory || 0;
  // Initialize stock status
  let inStock = false;

  // FIXED STOCK DETERMINATION LOGIC
  // Case 1: If variant data is loaded, check the variants directly
  if (product.variants && product.variants.length > 0) {
    // Check if any loaded variant has inventory
    inStock = product.variants.some(
      (variant) => variant && variant.inventory > 0
    );
  }
  // Case 2: If variants array is empty but we know there are variants
  else if (product.variantCount > 0) {
    // For product listings, we don't load all variants - assume in stock if variants exist
    // This prevents false "out of stock" messages when variants aren't loaded
    inStock = true;
  }
  // Case 3: No variants, check product inventory directly
  else {
    inStock = typeof product.inventory === "number" && product.inventory > 0;
  }

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "";
  };

  // Handle add to cart with inventory check
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      toast.error("This product is out of stock", {
        position: "bottom-right",
      });
      return;
    }

    // If product has multiple variants, navigate to product details page
    if (product.variants && product.variants.length > 1) {
      navigate(`/products/${product.slug}`);
      toast.info("Please select a variant", {
        position: "bottom-right",
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      const variant = firstVariant ? firstVariant._id : product._id;

      // Add the product to cart (default to first variant)
      const result = await addToCart(variant, 1);

      if (result.success) {
        toast.success(`${product.name} added to your cart!`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        // Handle specific errors (e.g. inventory issues)
        if (result.error && result.error.includes("inventory")) {
          toast.error("Not enough inventory available", {
            position: "bottom-right",
          });
        } else {
          toast.error(result.error || "Failed to add to cart", {
            position: "bottom-right",
          });
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.", {
        position: "bottom-right",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Quick view handler
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.slug}`);
  };

  return (
    <div
      className={`card h-100 border-0 shadow-sm overflow-hidden product-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-5px)" : "translateY(0)",
      }}
    >
      <Link to={`/products/${product.slug}`} className="text-decoration-none">
        {/* Product image with hover effect */}
        <div
          className="overflow-hidden bg-light"
          style={{ minHeight: "220px", position: "relative" }}
        >
          {/* Background gradient for elegant look */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 70%, rgba(240,240,240,1) 100%)",
              opacity: 0.8,
            }}
          ></div>

          {mainImage ? (
            <img
              src={mainImage.imageUrl}
              alt={mainImage.alt || product.name}
              className="img-fluid p-3"
              style={{
                objectFit: "contain",
                width: "100%",
                height: "220px",
                transition: "transform 0.5s ease",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
                position: "relative",
                zIndex: 1,
              }}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <span className="text-muted">No image</span>
            </div>
          )}

          {/* Quick action buttons on hover */}
          <div
            className="position-absolute bottom-0 start-0 w-100 p-2"
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
              height: "80px",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-danger rounded-circle"
                title="Add to cart"
                onClick={handleAddToCart}
                disabled={isAddingToCart || inventory <= 0}
              >
                {isAddingToCart ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <i className="bi bi-cart-plus"></i>
                )}
              </button>
              <button
                className="btn btn-sm btn-light rounded-circle"
                title="Quick view"
                onClick={handleQuickView}
              >
                <i className="bi bi-eye"></i>
              </button>
            </div>
          </div>

          {/* Product badges with improved z-index */}
          <div
            className="position-absolute top-0 start-0 p-2"
            style={{ zIndex: 3 }}
          >
            {discount && (
              <div className="badge bg-danger mb-1 rounded-pill px-3 fw-medium d-block">
                {discount}% OFF
              </div>
            )}
            {product.isNewProduct && (
              <div className="d-block badge bg-success rounded-pill px-3 fw-medium mb-1">
                NEW
              </div>
            )}
            {product.isBestSeller && (
              <div className="d-block badge bg-warning text-dark rounded-pill px-3 fw-medium">
                BEST SELLER
              </div>
            )}
          </div>

          {/* Stock badge */}
          <div
            className="position-absolute top-0 end-0 p-2"
            style={{ zIndex: 3 }}
          >
            {!inStock ? (
              <div className="badge bg-secondary rounded-pill px-3 fw-medium">
                OUT OF STOCK
              </div>
            ) : product.variants && product.variants.length > 1 ? (
              <div className="badge bg-primary rounded-pill px-3 fw-medium">
                {product.variants.length} VARIANTS
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Product details */}
      <div className="card-body d-flex flex-column p-3 bg-white">
        {/* Brand with gradient badge */}
        <div className="mb-1">
          <span
            className="badge rounded-pill px-2 py-1 fw-normal"
            style={{
              background: "linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)",
              color: "#6c757d",
              border: "1px solid #dee2e6",
            }}
          >
            {product.brand}
          </span>
        </div>

        {/* Product name */}
        <Link to={`/products/${product.slug}`} className="text-decoration-none">
          <h6
            className="card-title product-title mb-2 text-dark fw-medium"
            style={{
              height: "40px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              transition: "color 0.2s ease",
              color: isHovered ? "#dc3545" : "inherit",
            }}
          >
            {product.name}
          </h6>
        </Link>

        {/* Rating with improved visibility */}
        <div className="mb-2">
          <Rating
            value={product.averageRating || 0}
            size="small"
            count={product.reviewCount || 0}
            readOnly
          />
        </div>

        {/* Variant indicator if multiple variants exist */}
        {product.variants && product.variants.length > 1 && (
          <div className="mb-2">
            <span className="badge bg-light text-secondary border">
              {product.variants.length} variants available
            </span>
          </div>
        )}

        {/* Price with more elegant styling */}
        <div className="mt-auto">
          <div className="d-flex align-items-center">
            {salePrice ? (
              <>
                <div className="text-danger fw-bold me-2 fs-5">
                  ₫{formatPrice(salePrice)}
                </div>
                <div className="text-muted small text-decoration-line-through opacity-75">
                  ₫{formatPrice(regularPrice)}
                </div>
              </>
            ) : (
              <div className="fw-bold fs-5">₫{formatPrice(regularPrice)}</div>
            )}
          </div>
        </div>

        {/* Add to cart button with enhanced functionality */}
        <div className="mt-3">
          <button
            className={`btn btn-sm w-100 ${
              inStock ? "btn-danger" : "btn-secondary"
            } fw-medium`}
            onClick={handleAddToCart}
            disabled={isAddingToCart || !inStock}
            style={{
              transition: "all 0.3s ease",
            }}
          >
            {isAddingToCart ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Adding...
              </>
            ) : inStock ? (
              <>
                <i className="bi bi-cart-plus me-1"></i>
                {product.variants && product.variants.length > 1
                  ? "Select Options"
                  : "Add to Cart"}
              </>
            ) : (
              <>
                <i className="bi bi-x-circle me-1"></i>
                Out of Stock
              </>
            )}
          </button>
        </div>

        {/* Status indicators */}
        {inventory <= 5 && inventory > 0 && (
          <div className="mt-2">
            <small className="text-danger fw-medium">
              <i className="bi bi-exclamation-circle me-1"></i>
              Only {inventory} left
            </small>
          </div>
        )}
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
    inventory: PropTypes.number,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        price: PropTypes.number,
        salePrice: PropTypes.number,
        inventory: PropTypes.number,
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
