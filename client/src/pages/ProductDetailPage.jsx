import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/product.service";
import Button from "../../components/ui/Button";
import ProductCard from "../../components/ui/ProductCard";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [addToCartError, setAddToCartError] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productService.getProductBySlug(slug);

        if (response.success) {
          setProduct(response.data);

          // Set default selected variant to first one
          if (response.data.variants && response.data.variants.length > 0) {
            setSelectedVariant(response.data.variants[0]);
          }

          // Set default main image
          if (response.data.images && response.data.images.length > 0) {
            const main =
              response.data.images.find((img) => img.isMain) ||
              response.data.images[0];
            setMainImage(main);
          }

          // Fetch related products
          if (response.data.categories && response.data.categories.length > 0) {
            const categorySlug = response.data.categories[0].slug;
            fetchRelatedProducts(categorySlug, response.data._id);
          }
        } else {
          throw new Error(
            response.message || "Failed to fetch product details"
          );
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  // Fetch product reviews
  useEffect(() => {
    const fetchProductReviews = async () => {
      if (!product || !product._id) return;

      try {
        setReviewsLoading(true);
        const response = await productService.getProductReviews(product._id);

        if (response.success) {
          setReviews(response.data.reviews || []);
        }
      } catch (err) {
        console.error("Error fetching product reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProductReviews();
  }, [product]);

  // Fetch related products from same category
  const fetchRelatedProducts = async (categorySlug, productId) => {
    try {
      const response = await productService.getProductsByCategory(
        categorySlug,
        { limit: 4 }
      );

      if (response.success) {
        // Filter out current product and limit to 4 items
        const filtered = response.data.products
          .filter((p) => p._id !== productId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  // Handle variant selection
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);

    // Update quantity to 1 when changing variants
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
  const handleThumbnailClick = (image) => {
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

  // Handle buy now
  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    try {
      setAddingToCart(true);
      setAddToCartError(null);

      const result = await addToCart(selectedVariant._id, quantity);

      if (result.success) {
        navigate("/cart");
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

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
            <Link
              to="/products"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const displayPrice = selectedVariant?.price || product.basePrice;
  const displaySalePrice = selectedVariant?.salePrice || product.salePrice;
  const discount = calculateDiscount(displayPrice, displaySalePrice);
  const isOutOfStock = selectedVariant && selectedVariant.inventory <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm text-gray-600">
          <li className="mx-1">
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
          </li>
          <li className="mx-1">/</li>
          {product.categories && product.categories.length > 0 && (
            <>
              <li className="mx-1">
                <Link
                  to={`/category/${product.categories[0].slug}`}
                  className="hover:text-primary-600"
                >
                  {product.categories[0].name}
                </Link>
              </li>
              <li className="mx-1">/</li>
            </>
          )}
          <li className="mx-1 text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>

      {/* Product details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product images */}
        <div>
          {/* Main image */}
          <div className="border rounded-lg overflow-hidden mb-4 bg-white p-4 flex items-center justify-center h-96">
            {mainImage ? (
              <img
                src={mainImage.imageUrl}
                alt={mainImage.alt || product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="bg-gray-200 flex items-center justify-center h-full w-full">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          {/* Image thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image) => (
                <div
                  key={image._id}
                  className={`border rounded-md overflow-hidden cursor-pointer h-20 bg-white p-1 flex items-center justify-center ${
                    mainImage && mainImage._id === image._id
                      ? "border-primary-600"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleThumbnailClick(image)}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.alt || product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Brand */}
          <div className="mb-4">
            <span className="text-gray-600">Brand: </span>
            <span className="font-medium">{product.brand}</span>
          </div>

          {/* Ratings */}
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
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
            <span className="text-gray-600">
              ({product.reviewCount || 0}{" "}
              {product.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {displaySalePrice ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-600 mr-2">
                  ₫{formatPrice(displaySalePrice)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₫{formatPrice(displayPrice)}
                </span>
                {discount && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ₫{formatPrice(displayPrice)}
              </span>
            )}
          </div>

          {/* Short description */}
          <div className="mb-6">
            <p className="text-gray-600">{product.shortDescription}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Variants</h3>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    className={`border rounded-md py-2 px-4 text-left hover:border-primary-600 ${
                      selectedVariant && selectedVariant._id === variant._id
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-300"
                    } ${
                      variant.inventory <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() =>
                      variant.inventory > 0 && handleVariantChange(variant)
                    }
                    disabled={variant.inventory <= 0}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <div>
                        {variant.salePrice ? (
                          <div className="text-right">
                            <span className="text-red-600 font-semibold">
                              ₫{formatPrice(variant.salePrice)}
                            </span>
                            <span className="text-gray-500 text-sm line-through ml-1">
                              ₫{formatPrice(variant.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold">
                            ₫{formatPrice(variant.price)}
                          </span>
                        )}
                        {variant.inventory <= 0 && (
                          <span className="text-red-600 text-sm">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                className="border border-gray-300 rounded-l-md px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isOutOfStock}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                className="border-t border-b border-gray-300 text-center w-16 py-2"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedVariant?.inventory || 1}
                disabled={isOutOfStock}
              />
              <button
                className="border border-gray-300 rounded-r-md px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={incrementQuantity}
                disabled={
                  !selectedVariant ||
                  quantity >= selectedVariant.inventory ||
                  isOutOfStock
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              {selectedVariant && (
                <span className="ml-4 text-sm text-gray-500">
                  {selectedVariant.inventory} available
                </span>
              )}
            </div>
          </div>

          {/* Add to cart and buy now buttons */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant="outlined"
              size="large"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex-1"
            >
              {addingToCart ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </span>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </Button>
            <Button
              variant="primary"
              size="large"
              onClick={handleBuyNow}
              disabled={isOutOfStock || addingToCart}
              className="flex-1"
            >
              Buy Now
            </Button>
          </div>

          {/* Add to cart success/error messages */}
          {addToCartSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Item added to cart successfully!
            </div>
          )}
          {addToCartError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {addToCartError}
            </div>
          )}

          {/* Product specs */}
          {selectedVariant &&
            selectedVariant.attributes &&
            Object.keys(selectedVariant.attributes).length > 0 && (
              <div className="border rounded-lg overflow-hidden mb-6">
                <h3 className="bg-gray-100 px-4 py-2 font-semibold">
                  Specifications
                </h3>
                <div className="p-4">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(selectedVariant.attributes).map(
                        ([key, value]) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <td className="py-2 text-gray-600 w-1/3 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </td>
                            <td className="py-2">{value}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Product description */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Product Description</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {reviewsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
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
                    <span className="font-semibold">{review.userName}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No reviews yet. Be the first to review this product!
              </p>
              <Link to={`/products/${slug}/review`}>
                <Button variant="outlined" className="mt-4">
                  Write a Review
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
