import React from "react";
import PropTypes from "prop-types";

/**
 * Loader component for displaying loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the loader ('small', 'medium', 'large')
 * @param {string} props.color - Color of the loader ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark')
 * @param {string} props.type - Type of loader ('spinner', 'dots', 'pulse', 'ring')
 * @param {string} props.text - Text to display with the loader
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Whether loader should cover the full screen
 */
const Loader = ({
  size = "medium",
  color = "primary",
  type = "spinner",
  text = "",
  className = "",
  fullScreen = false,
}) => {
  // Size classes for different loader types
  const sizeClasses = {
    spinner: {
      small: "h-4 w-4",
      medium: "h-8 w-8",
      large: "h-12 w-12",
    },
    dots: {
      small: "h-1 w-1",
      medium: "h-2 w-2",
      large: "h-3 w-3",
    },
    pulse: {
      small: "h-6 w-6",
      medium: "h-10 w-10",
      large: "h-16 w-16",
    },
    ring: {
      small: "h-6 w-6",
      medium: "h-10 w-10",
      large: "h-16 w-16",
    },
  };

  // Color classes
  const colorClasses = {
    primary: "text-primary-600",
    secondary: "text-gray-600",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
    light: "text-gray-200",
    dark: "text-gray-800",
  };

  // Text size based on loader size
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  // Container classes for full screen loading
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
    : "flex items-center justify-center";

  // Render spinner loader
  const renderSpinner = () => (
    <svg
      className={`animate-spin ${sizeClasses.spinner[size]} ${colorClasses[color]}`}
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
  );

  // Render dots loader
  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses.dots[size]} ${colorClasses[color]} rounded-full`}
          style={{
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${i * 0.16}s`,
          }}
        ></div>
      ))}
    </div>
  );

  // Render pulse loader
  const renderPulse = () => (
    <div
      className={`${sizeClasses.pulse[size]} ${colorClasses[color]} rounded-full`}
      style={{
        animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    ></div>
  );

  // Render ring loader
  const renderRing = () => (
    <div
      className={`${sizeClasses.ring[size]} ${colorClasses[color]} border-t-2 border-b-2 rounded-full`}
      style={{
        animation: "spin 1s linear infinite",
      }}
    ></div>
  );

  // Render loader based on type
  const renderLoader = () => {
    switch (type) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "ring":
        return renderRing();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center">
        {renderLoader()}
        {text && (
          <p className={`mt-3 ${colorClasses[color]} ${textSizeClasses[size]}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ]),
  type: PropTypes.oneOf(["spinner", "dots", "pulse", "ring"]),
  text: PropTypes.string,
  className: PropTypes.string,
  fullScreen: PropTypes.bool,
};

// Add keyframes animation styles
const LoaderStyle = () => (
  <style jsx global>{`
    @keyframes bounce {
      0%,
      80%,
      100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `}</style>
);

// Combine Loader with its styles
const LoaderWithStyle = (props) => (
  <>
    <LoaderStyle />
    <Loader {...props} />
  </>
);

export default LoaderWithStyle;
