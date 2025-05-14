import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useCart } from "../../contexts/CartContext";

/**
 * CartItem component showing product information, price, quantity controls, and a remove button
 * Styled with Bootstrap
 */
const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();

  // Extract product details
  const { productVariantId, quantity, price } = item;
  const product = productVariantId.productId;
  const variant = productVariantId;
  const mainImage =
    productVariantId.images && productVariantId.images.length > 0
      ? productVariantId.images[0]
      : null;

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "";
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateCartItem(productVariantId._id, newQuantity);
    }
  };

  // Handle increment/decrement
  const decrementQuantity = () => {
    if (quantity > 1) {
      updateCartItem(productVariantId._id, quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < variant.inventory) {
      updateCartItem(productVariantId._id, quantity + 1);
    }
  };

  // Handle remove item
  const handleRemove = () => {
    removeFromCart(productVariantId._id);
  };

  // Calculate total for this item
  const subtotal = quantity * price;

  return (
    <div className="card mb-3 border-0 border-bottom pb-3">
      <div className="row g-0">
        {/* Product image */}
        <div className="col-4 col-md-2">
          <Link to={`/products/${product?.slug || "#"}`}>
            <div className="ratio ratio-1x1 overflow-hidden bg-light">
              {mainImage ? (
                <img
                  src={mainImage.imageUrl}
                  alt={mainImage.alt || product?.name || "Product"}
                  className="img-fluid p-2 object-fit-contain"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center">
                  <span className="text-muted small">No image</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Product info */}
        <div className="col-8 col-md-10">
          <div className="card-body p-0 ps-3 d-flex flex-column h-100">
            <div className="row h-100">
              {/* Product details */}
              <div className="col-12 col-md-5 mb-3 mb-md-0">
                <Link
                  to={`/products/${product?.slug || "#"}`}
                  className="text-decoration-none"
                >
                  <h5 className="card-title fs-6 fw-bold text-dark">
                    {product?.name || "Product"}
                  </h5>
                </Link>

                <p className="card-text text-muted small mb-2">
                  {variant?.name || "Standard"}
                </p>

                {variant.inventory <= 5 && (
                  <div className="badge bg-warning text-dark">
                    Only {variant.inventory} left
                  </div>
                )}

                {/* Mobile price (visible on small screens) */}
                <div className="d-md-none mt-2">
                  <div className="fw-bold text-danger">
                    ₫{formatPrice(price)}
                  </div>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="col-7 col-md-3 d-flex flex-column justify-content-center">
                <div className="input-group input-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={variant.inventory}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="form-control text-center"
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={incrementQuantity}
                    disabled={quantity >= variant.inventory}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger p-0 mt-2 align-self-start"
                  onClick={handleRemove}
                >
                  <i className="bi bi-trash me-1"></i> Remove
                </button>
              </div>

              {/* Price and subtotal */}
              <div className="col-5 col-md-4 text-end d-flex flex-column justify-content-center">
                {/* Unit price (hidden on small screens) */}
                <div className="d-none d-md-block text-muted mb-1">
                  <small>Unit price:</small>
                  <div>₫{formatPrice(price)}</div>
                </div>

                {/* Subtotal */}
                <div>
                  <small className="text-muted">Subtotal:</small>
                  <div className="fw-bold text-danger">
                    ₫{formatPrice(subtotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        }),
        images: PropTypes.array,
      }),
    ]).isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default CartItem;
