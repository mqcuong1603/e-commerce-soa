import React from "react";
import PropTypes from "prop-types";

/**
 * Rating component for displaying star ratings with optional interactive capability
 * @param {number} value - Current rating value (1-5)
 * @param {number} maxValue - Maximum rating value (default: 5)
 * @param {function} onChange - Callback when rating changes (for interactive mode)
 * @param {boolean} readOnly - Whether the rating can be changed by user
 * @param {string} size - Size of stars ('small', 'medium', 'large')
 * @param {boolean} showLabel - Whether to show the numeric rating label
 * @param {number} count - Number of reviews (optional)
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
  // Calculate the percentage of stars filled
  const percentage = (value / maxValue) * 100;

  // Size classes for different star sizes
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-5 h-5",
    large: "w-6 h-6",
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
      // Set visual feedback for hover state
      const stars = document.querySelectorAll(".rating-star");
      for (let i = 0; i < stars.length; i++) {
        if (i <= index) {
          stars[i].classList.add("text-yellow-400");
          stars[i].classList.remove("text-gray-300");
        } else {
          stars[i].classList.remove("text-yellow-400");
          stars[i].classList.add("text-gray-300");
        }
      }
    }
  };

  // Handle mouse leaving the rating component (for interactive mode)
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
        stars[i].classList.add("text-yellow-400");
        stars[i].classList.remove("text-gray-300");
      } else {
        stars[i].classList.remove("text-yellow-400");
        stars[i].classList.add("text-gray-300");
      }
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={`flex items-center ${!readOnly ? "cursor-pointer" : ""}`}
        onMouseLeave={handleMouseLeave}
      >
        {[...Array(maxValue)].map((_, index) => (
          <span
            key={index}
            className={`rating-star ${
              index < Math.round(value) ? "text-yellow-400" : "text-gray-300"
            } ${!readOnly ? "hover:scale-110 transition-transform" : ""}`}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => handleMouseEnter(index)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={starSize}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        ))}
      </div>

      {/* Show rating as text if enabled */}
      {showLabel && (
        <span className="ml-1 text-gray-600">
          {value.toFixed(1)}
          {count !== undefined && (
            <span className="text-gray-500">
              {" "}
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          )}
        </span>
      )}

      {/* Show review count if provided without label */}
      {!showLabel && count !== undefined && (
        <span className="ml-1 text-gray-500 text-sm">
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}

      {/* Guidance for interactive mode */}
      {!readOnly && (
        <span className="ml-2 text-xs text-gray-500">Click to rate</span>
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
