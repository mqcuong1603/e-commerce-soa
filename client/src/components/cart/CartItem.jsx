import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

/**
 * Enhanced CartItem component showing product information with improved UX
 * Real-time quantity controls, inventory awareness, and visual feedback
 */
const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [showQuantityError, setShowQuantityError] = useState(false);

  // Extract product details
  const { productVariantId, price } = item;
  const product = productVariantId.productId;
  const variant = productVariantId;

  // Get product image - products always have the images, not variants
  let imageUrl = null;
  if (product && product.images && product.images.length > 0) {
    // Try to find the main image first
    const mainImage =
      product.images.find((img) => img.isMain) || product.images[0];
    imageUrl = mainImage.imageUrl; // Add this critical line
    console.log("Image URL assigned:", imageUrl); // Add for debugging
  }

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "";
  };

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    const newValue = parseInt(e.target.value);

    // Validate input
    if (isNaN(newValue) || newValue < 1) {
      setQuantity(1);
      return;
    }

    // Check inventory limits
    if (variant && newValue > variant.inventory) {
      setQuantity(variant.inventory);
      setShowQuantityError(true);
      // Auto-hide error after 3 seconds
      setTimeout(() => setShowQuantityError(false), 3000);
      return;
    }

    setQuantity(newValue);

    // Debounce update to reduce API calls
    if (!isUpdating) {
      const timer = setTimeout(() => {
        updateItemQuantity(newValue);
      }, 500);

      return () => clearTimeout(timer);
    }
  };

  // Handle increment/decrement
  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateItemQuantity(newQuantity);
    }
  };

  const incrementQuantity = () => {
    if (variant && quantity < variant.inventory) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      updateItemQuantity(newQuantity);
    } else {
      setShowQuantityError(true);
      // Auto-hide error after 3 seconds
      setTimeout(() => setShowQuantityError(false), 3000);
    }
  };

  // Update item quantity with API call
  const updateItemQuantity = async (newQuantity) => {
    if (newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      await updateCartItem(productVariantId._id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert to original quantity on failure
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle remove item
  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(productVariantId._id);
    } catch (error) {
      console.error("Error removing item:", error);
      setIsRemoving(false);
    }
  };

  // Calculate total for this item
  const subtotal = quantity * price;

  return (
    <div className="card mb-4 border-0 shadow-sm rounded-3 overflow-hidden bg-white">
      <div className="row g-0">
        {/* Product image with colorful border accent */}
        <div className="col-4 col-md-2 p-2 bg-light">
          <Link
            to={`/products/${product?.slug || "#"}`}
            className="d-block h-100"
          >
            <div className="position-relative h-100 rounded-3 overflow-hidden bg-gradient">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product?.name || "Product"}
                  className="img-fluid h-100 w-100 object-fit-contain p-1"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                  <span className="text-muted small">No image</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Product info with vibrant accents */}
        <div className="col-8 col-md-10">
          <div className="card-body p-3 h-100">
            <div className="row h-100">
              {/* Product details with colorful badges */}
              <div className="col-12 col-md-5 mb-3 mb-md-0">
                <Link
                  to={`/products/${product?.slug || "#"}`}
                  className="text-decoration-none"
                >
                  <h5 className="card-title fw-bold text-primary mb-1">
                    {product?.name || "Product"}
                  </h5>
                </Link>

                <p className="card-text text-muted small mb-2">
                  <span className="badge bg-light text-secondary border rounded-pill me-2">
                    <i className="bi bi-tag-fill me-1 text-primary"></i>
                    {variant?.name || "Standard"}
                  </span>

                  {/* Brand badge */}
                  {product?.brand && (
                    <span className="badge bg-light text-secondary border rounded-pill">
                      {product.brand}
                    </span>
                  )}
                </p>

                {/* Inventory warning */}
                {variant && variant.inventory <= 5 && (
                  <div className="badge bg-warning text-dark rounded-pill px-3 py-2 shadow-sm">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Only {variant.inventory} left
                  </div>
                )}

                {/* Mobile price (visible on small screens) */}
                <div className="d-md-none mt-3">
                  <div className="fw-bold text-danger fs-5">
                    ₫{formatPrice(price)}
                  </div>
                </div>
              </div>

              {/* Quantity controls with vibrant design */}
              <div className="col-7 col-md-3 d-flex flex-column justify-content-center">
                <div className="input-group input-group-sm shadow-sm">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={decrementQuantity}
                    disabled={isUpdating || quantity <= 1}
                  >
                    <i className="bi bi-dash-lg"></i>
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={variant ? variant.inventory : 99}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className={`form-control text-center fw-bold ${
                      isUpdating ? "bg-light opacity-75" : "bg-white"
                    }`}
                    disabled={isUpdating}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={incrementQuantity}
                    disabled={
                      isUpdating || (variant && quantity >= variant.inventory)
                    }
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>

                {/* Quantity update indicator */}
                {isUpdating && (
                  <div className="small text-primary text-center mt-1">
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </div>
                )}

                {/* Quantity error message */}
                {showQuantityError && (
                  <div className="small text-danger text-center mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    Max quantity reached
                  </div>
                )}

                <button
                  type="button"
                  className={`btn btn-sm text-danger p-0 mt-3 d-flex align-items-center ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span className="small fw-semibold">Removing...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash-fill me-2"></i>
                      <span className="small fw-semibold">Remove</span>
                    </>
                  )}
                </button>
              </div>

              {/* Price and subtotal with accent colors */}
              <div className="col-5 col-md-4 text-end d-flex flex-column justify-content-center">
                {/* Unit price (hidden on small screens) */}
                <div className="d-none d-md-block mb-2">
                  <small className="text-muted d-block">Unit price:</small>
                  <div className="badge bg-light text-secondary border px-3 py-2">
                    ₫{formatPrice(price)}
                  </div>
                </div>

                {/* Subtotal with vibrant styling */}
                <div>
                  <small className="text-muted d-block">Subtotal:</small>
                  <div className="badge bg-danger text-white px-3 py-2 fs-6 shadow-sm">
                    ₫{formatPrice(subtotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border with gradient */}
      <div
        className="bg-gradient p-1"
        style={{
          background: "linear-gradient(90deg, #dc3545, #fd7e14, #ffc107)",
        }}
      ></div>
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    productVariantId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        price: PropTypes.number,
        salePrice: PropTypes.number,
        inventory: PropTypes.number,
        productId: PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
          slug: PropTypes.string,
          brand: PropTypes.string,
        }),
        images: PropTypes.array,
      }),
    ]).isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default CartItem;
