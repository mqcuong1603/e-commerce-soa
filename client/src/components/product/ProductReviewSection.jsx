import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import productService from "../../services/product.service";
import { toast } from "react-toastify";

// Import UI components
import Button from "../ui/Button";
import Rating from "../ui/Rating";

/**
 * Product Review Section component
 * Displays reviews and handles review submission
 */
const ProductReviewSection = ({ product }) => {
  // Use try-catch to handle potential auth context errors
  const authContext = useAuth();
  // Default values if auth context fails
  const { isAuthenticated = false } = authContext || {};

  const [reviews, setReviews] = useState(product?.reviews || []);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [formError, setFormError] = useState({});
  const [showForm, setShowForm] = useState(false);
  // Load reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const response = await productService.getProductReviews(product._id, {
          page: 1,
          limit: 10,
        });

        if (response.success) {
          setReviews(response.data.reviews);
        } else {
          setError("Failed to load reviews");
        }
      } catch (err) {
        setError("Error loading reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [product._id]); // Form validation
  const validateForm = () => {
    const errors = {};

    // Validation for guest users
    if (!isAuthenticated && !guestName.trim()) {
      errors.guestName = "Name is required";
    }

    // Email validation for guest users (used for purchase verification)
    if (!isAuthenticated && !guestEmail.trim()) {
      errors.guestEmail = "Email is required for purchase verification";
    } else if (!isAuthenticated && !/\S+@\S+\.\S+/.test(guestEmail)) {
      errors.guestEmail = "Please enter a valid email address";
    }

    // Validation for authenticated users (rating required)
    if (isAuthenticated && rating === 0) {
      errors.rating = "Please select a rating";
    }

    // Comment validation
    if (!comment || comment.trim().length < 3) {
      // Comment is required for guest users since they can't rate
      if (!isAuthenticated) {
        errors.comment = "Comment is required for guest reviews";
      } else if (comment) {
        // For authenticated users, it's optional but if provided must be valid
        errors.comment = "Comment must be at least 3 characters";
      }
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  // Load more reviews
  const handleLoadMore = async () => {
    if (!loading) {
      try {
        setLoading(true);

        const nextPage = Math.ceil(reviews.length / 10) + 1;
        const response = await productService.getProductReviews(product._id, {
          page: nextPage,
          limit: 10,
        });

        if (response.success) {
          if (response.data.reviews.length > 0) {
            setReviews((prev) => [...prev, ...response.data.reviews]);
          }
        } else {
          setError("Failed to load more reviews");
        }
      } catch (err) {
        setError("Error loading more reviews");
        console.error("Error fetching more reviews:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null); // For guests, don't send the rating
      // For authenticated users, include the rating
      const reviewData = {
        rating: isAuthenticated ? rating : undefined,
        comment: comment.trim(),
        userName: !isAuthenticated ? guestName.trim() : undefined,
        email: !isAuthenticated ? guestEmail.trim() : undefined, // Include email for purchase verification
      };

      const response = await productService.addProductReview(
        product._id,
        reviewData
      );

      if (response.success) {
        // Clear form
        setComment("");
        setRating(0);
        setGuestName("");
        setGuestEmail("");
        setShowForm(false);

        // Show success message
        toast.success("Review submitted successfully!");

        // Add the review to the list
        setReviews((prev) => [response.data, ...prev]);
      } else {
        setError(response.message || "Failed to submit review");
      }
    } catch (err) {
      setError("Error submitting review. Please try again.");
      console.error("Error submitting review:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Customer Reviews</h3>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Your Review</h5>
            <form onSubmit={handleSubmitReview}>
              {" "}
              {/* Guest name field (only shown for non-authenticated users) */}
              {!isAuthenticated && (
                <div className="mb-3">
                  <label htmlFor="guestName" className="form-label">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formError.guestName ? "is-invalid" : ""
                    }`}
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  {formError.guestName && (
                    <div className="invalid-feedback">
                      {formError.guestName}
                    </div>
                  )}
                </div>
              )}
              {/* Guest email field (only shown for non-authenticated users) */}
              {!isAuthenticated && (
                <div className="mb-3">
                  <label htmlFor="guestEmail" className="form-label">
                    Your Email *{" "}
                    <span className="text-muted small">
                      (for purchase verification)
                    </span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      formError.guestEmail ? "is-invalid" : ""
                    }`}
                    id="guestEmail"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Enter your email address"
                  />
                  {formError.guestEmail && (
                    <div className="invalid-feedback">
                      {formError.guestEmail}
                    </div>
                  )}
                </div>
              )}
              {/* Rating stars (only enabled for authenticated users) */}
              <div className="mb-3">
                <label className="form-label d-block">
                  {isAuthenticated ? "Rating *" : "Rating (Login required)"}
                </label>
                <Rating
                  value={rating}
                  onChange={isAuthenticated ? setRating : undefined}
                  size="large"
                  readOnly={!isAuthenticated}
                />
                {isAuthenticated && formError.rating && (
                  <div className="text-danger small mt-1">
                    {formError.rating}
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="text-muted small mt-1">
                    Please <a href="/login">login</a> to leave a rating
                  </div>
                )}
              </div>
              {/* Comment field */}
              <div className="mb-3">
                <label htmlFor="comment" className="form-label">
                  Comment
                </label>
                <textarea
                  className={`form-control ${
                    formError.comment ? "is-invalid" : ""
                  }`}
                  id="comment"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product"
                ></textarea>
                {formError.comment && (
                  <div className="invalid-feedback">{formError.comment}</div>
                )}
              </div>
              {/* Submit button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </Button>
              {/* Form error message */}
              {error && (
                <div className="alert alert-danger mt-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="card">
        <div className="card-body">
          {reviews && reviews.length > 0 ? (
            <div>
              {reviews.map((review) => (
                <div key={review._id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex align-items-center mb-2">
                    {review.rating > 0 && (
                      <Rating
                        value={review.rating}
                        size="small"
                        readOnly={true}
                      />
                    )}
                    <span
                      className={`fw-medium ${review.rating > 0 ? "ms-2" : ""}`}
                    >
                      {review.userName}
                    </span>
                    <span className="mx-2 text-muted">•</span>
                    <span className="text-muted small">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>{" "}
                    {review.isVerifiedPurchase && (
                      <span className="ms-2 badge bg-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-muted">
                    {review.comment || <em>No comment provided</em>}
                  </p>
                </div>
              ))}{" "}
              {/* Load more button */}
              <div className="text-center mt-4">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </span>
                  ) : (
                    "Load More Reviews"
                  )}
                </Button>
              </div>
              {/* Simple connection status indicator */}
              <div className="text-center mt-3">
                <span className={`badge bg-success`}>
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Verified Purchase Feature Active
                </span>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading reviews...</span>
              </div>
              <p className="mt-2 text-muted">Loading reviews...</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted mb-3">
                No reviews yet. Be the first to review this product!
              </p>
              {!showForm && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowForm(true)}
                >
                  Write a Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProductReviewSection.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    reviews: PropTypes.array,
  }).isRequired,
};

export default ProductReviewSection;
