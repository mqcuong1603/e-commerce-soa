import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useCart } from "../../contexts/CartContext";

/**
 * Cart item component showing product information, price, quantity controls, and a remove button
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
    <div className="flex flex-col md:flex-row border-b py-4">
      {/* Product image */}
      <div className="flex-shrink-0 w-full md:w-24 h-24 mb-4 md:mb-0 mr-0 md:mr-4">
        <Link to={`/products/${product?.slug || "#"}`}>
          {mainImage ? (
            <img
              src={mainImage.imageUrl}
              alt={mainImage.alt || product?.name || "Product"}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}
        </Link>
      </div>

      {/* Product info */}
      <div className="flex-grow md:mr-4">
        <Link
          to={`/products/${product?.slug || "#"}`}
          className="text-lg font-medium text-gray-900 hover:text-primary-600"
        >
          {product?.name || "Product"}
        </Link>

        <div className="text-sm text-gray-500 mt-1">
          {variant?.name || "Standard"}
        </div>

        {variant.inventory <= 5 && (
          <div className="text-sm text-red-600 mt-1">
            Only {variant.inventory} left in stock
          </div>
        )}

        {/* Mobile price (visible on small screens) */}
        <div className="md:hidden mt-2">
          <div className="text-lg font-medium text-gray-900">
            ₫{formatPrice(price)}
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              className="px-3 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <input
              type="number"
              min="1"
              max={variant.inventory}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-12 text-center border-x border-gray-300 py-1 focus:outline-none"
            />

            <button
              type="button"
              className="px-3 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={incrementQuantity}
              disabled={quantity >= variant.inventory}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v12m6-6H6"
                />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="ml-4 text-red-600 hover:text-red-800 focus:outline-none text-sm"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Price (hidden on small screens) */}
      <div className="hidden md:block text-right flex-shrink-0 w-24">
        <div className="text-lg font-medium text-gray-900">
          ₫{formatPrice(price)}
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0 mt-4 md:mt-0 md:w-32">
        <div className="text-lg font-medium text-gray-900">
          ₫{formatPrice(subtotal)}
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
