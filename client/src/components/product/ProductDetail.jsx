import React, { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useCart } from "../../contexts/CartContext";

// Import UI components
import Button from "../ui/Button";
import Rating from "../ui/Rating";

// Import product components
import ProductGallery from "./ProductGallery";
import ProductVariantSelector from "./ProductVariantSelector";
import ProductReviewSection from "./ProductReviewSection";

/**
 * Product Detail component to display single product information
 */
const ProductDetail = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isMain) || product.images[0]
      : null
  );
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [addToCartError, setAddToCartError] = useState(null);

  // Handle variant selection
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  // Handle quantity changes
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (selectedVariant && value > selectedVariant.inventory) {
      setQuantity(selectedVariant.inventory);
    } else {
      setQuantity(value);
    }
  };

  // Handle quantity increment/decrement
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.inventory) {
      setQuantity(quantity + 1);
    }
  };

  // Set main image when thumbnail is clicked
  const handleImageChange = (image) => {
    setMainImage(image);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      setAddingToCart(true);
      setAddToCartError(null);

      const result = await addToCart(selectedVariant._id, quantity);

      if (result.success) {
        setAddToCartSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setAddToCartSuccess(false);
        }, 3000);
      } else {
        setAddToCartError(result.error || "Failed to add item to cart");
      }
    } catch (err) {
      setAddToCartError("An error occurred while adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "";
  };

  // Calculate discount percentage if sale price exists
  const calculateDiscount = (price, salePrice) => {
    if (salePrice && price && salePrice < price) {
      const discount = ((price - salePrice) / price) * 100;
      return Math.round(discount);
    }
    return null;
  };

  const displayPrice = selectedVariant?.price || product.basePrice;
  const displaySalePrice = selectedVariant?.salePrice || product.salePrice;
  const discount = calculateDiscount(displayPrice, displaySalePrice);
  const isOutOfStock = selectedVariant && selectedVariant.inventory <= 0;

  return (
    <div>
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          {product.categories && product.categories.length > 0 && (
            <li className="breadcrumb-item">
              <Link to={`/category/${product.categories[0].slug}`}>
                {product.categories[0].name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>
      <div className="row g-4 mb-5">
        {/* Product images */}
        <div className="col-lg-6">
          <ProductGallery
            images={product.images}
            mainImage={mainImage}
            onImageChange={handleImageChange}
          />
        </div>

        {/* Product info */}
        <div className="col-lg-6">
          <h1 className="fs-2 fw-bold mb-2">{product.name}</h1>

          {/* Brand */}
          <div className="mb-3">
            <span className="text-muted">Brand: </span>
            <span className="fw-medium">{product.brand}</span>
          </div>

          {/* Ratings */}
          <div className="mb-3">
            <Rating
              value={product.averageRating || 0}
              count={product.reviewCount}
              showLabel={true}
              size="medium"
              readOnly={true}
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            {displaySalePrice ? (
              <div className="d-flex align-items-center">
                <span className="fs-3 fw-bold text-danger me-2">
                  ₫{formatPrice(displaySalePrice)}
                </span>
                <span className="fs-5 text-muted text-decoration-line-through">
                  ₫{formatPrice(displayPrice)}
                </span>
                {discount && (
                  <span className="ms-2 badge bg-danger">-{discount}%</span>
                )}
              </div>
            ) : (
              <span className="fs-3 fw-bold">₫{formatPrice(displayPrice)}</span>
            )}
          </div>

          {/* Short description */}
          <div className="mb-4">
            <p className="text-muted">{product.shortDescription}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <ProductVariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
                showPrice={true}
                layout="buttons"
              />
            </div>
          )}

          {/* Quantity selector */}
          <div className="mb-4">
            <h6 className="mb-2">Quantity</h6>
            <div className="d-flex align-items-center">
              <div className="input-group" style={{ maxWidth: "150px" }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <i className="bi bi-dash"></i>
                </Button>
                <input
                  type="number"
                  className="form-control text-center"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={selectedVariant?.inventory || 1}
                  disabled={isOutOfStock}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={incrementQuantity}
                  disabled={
                    !selectedVariant ||
                    quantity >= selectedVariant.inventory ||
                    isOutOfStock
                  }
                >
                  <i className="bi bi-plus"></i>
                </Button>
              </div>
              {selectedVariant && (
                <span className="ms-3 text-muted small">
                  {selectedVariant.inventory} available
                </span>
              )}
            </div>
          </div>

          {/* Add to cart and buy now buttons */}
          <div className="d-flex gap-3 mb-4">
            <Button
              variant="outlined"
              color="danger"
              fullWidth
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
            >
              {addingToCart ? (
                <span>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Adding...
                </span>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                <span>
                  <i className="bi bi-cart-plus me-2"></i>Add to Cart
                </span>
              )}
            </Button>
            <Button
              variant="contained"
              color="danger"
              fullWidth
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
            >
              Buy Now
            </Button>
          </div>

          {/* Success/Error messages */}
          {addToCartSuccess && (
            <div className="alert alert-success mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              Item added to cart successfully!
            </div>
          )}
          {addToCartError && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {addToCartError}
            </div>
          )}
        </div>
      </div>
      {/* Product description */}
      <div className="mb-5">
        <h3 className="fw-bold mb-3">Product Description</h3>
        <div className="card">
          <div className="card-body">
            <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
          </div>
        </div>
      </div>{" "}
      {/* Reviews section */}
      <ProductReviewSection product={product} />
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
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
    categories: PropTypes.array,
    reviews: PropTypes.array,
  }).isRequired,
};

export default ProductDetail;
