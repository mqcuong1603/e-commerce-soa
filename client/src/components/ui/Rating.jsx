import React from "react";
import PropTypes from "prop-types";

/**
 * Rating component for displaying star ratings with Bootstrap styling
 */
const Rating = ({
  value,
  maxValue = 5,
  onChange,
  readOnly = true,
  size = "medium",
  showLabel = false,
  count,
}) => {
  // Size classes for different star sizes
  const sizeClasses = {
    small: "fs-6",
    medium: "fs-5",
    large: "fs-4",
  };

  const starSize = sizeClasses[size] || sizeClasses.medium;

  // Handle clicking on a star (for interactive mode)
  const handleClick = (newValue) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  // Handle hovering over a star (for interactive mode)
  const handleMouseEnter = (index) => {
    if (!readOnly && onChange) {
      // Highlight stars up to this index
      const stars = document.querySelectorAll(".rating-star");
      for (let i = 0; i < stars.length; i++) {
        if (i <= index) {
          stars[i].classList.add("text-warning");
          stars[i].classList.remove("text-muted");
        } else {
          stars[i].classList.remove("text-warning");
          stars[i].classList.add("text-muted");
        }
      }
    }
  };

  // Handle mouse leaving the rating component
  const handleMouseLeave = () => {
    if (!readOnly && onChange) {
      // Reset to actual rating
      updateStars(value);
    }
  };

  // Update star colors based on rating
  const updateStars = (rating) => {
    const stars = document.querySelectorAll(".rating-star");
    for (let i = 0; i < stars.length; i++) {
      if (i < rating) {
        stars[i].classList.add("text-warning");
        stars[i].classList.remove("text-muted");
      } else {
        stars[i].classList.remove("text-warning");
        stars[i].classList.add("text-muted");
      }
    }
  };

  return (
    <div className="d-flex align-items-center">
      <div
        className={`d-flex ${!readOnly ? "cursor-pointer" : ""}`}
        onMouseLeave={handleMouseLeave}
      >
        {[...Array(maxValue)].map((_, index) => (
          <i
            key={index}
            className={`bi bi-star${
              index < Math.round(value) ? "-fill" : ""
            } rating-star ${
              index < Math.round(value) ? "text-warning" : "text-muted"
            } ${starSize} ${!readOnly ? "me-1" : ""}`}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => handleMouseEnter(index)}
            style={!readOnly ? { transition: "transform 0.1s ease" } : {}}
          ></i>
        ))}
      </div>

      {/* Show rating as text if enabled */}
      {showLabel && (
        <span className="ms-2 text-muted">
          {value.toFixed(1)}
          {count !== undefined && (
            <span className="text-muted">
              {" "}
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          )}
        </span>
      )}

      {/* Show review count if provided without label */}
      {!showLabel && count !== undefined && (
        <span className="ms-2 text-muted small">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}

      {/* Guidance for interactive mode */}
      {!readOnly && (
        <span className="ms-2 small text-muted">Click to rate</span>
      )}
    </div>
  );
};

Rating.propTypes = {
  value: PropTypes.number.isRequired,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  showLabel: PropTypes.bool,
  count: PropTypes.number,
};

export default Rating;
