import React from "react";
import PropTypes from "prop-types";

/**
 * Loader component using Bootstrap spinners
 */
const Loader = ({
  size = "medium",
  color = "primary",
  type = "border",
  text = "",
  centered = false,
  fullScreen = false,
  className = "",
}) => {
  // Map sizes to Bootstrap sizes
  const sizeClass =
    {
      small: "spinner-sm",
      medium: "", // default
      large: "spinner-lg",
    }[size] || "";

  // Map colors to Bootstrap colors
  const colorClass =
    {
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      danger: "text-danger",
      warning: "text-warning",
      info: "text-info",
      light: "text-light",
      dark: "text-dark",
    }[color] || "text-primary";

  // Choose spinner type
  const spinnerType = type === "grow" ? "spinner-grow" : "spinner-border";

  // Create the spinner element
  const spinner = (
    <div
      className={`${spinnerType} ${sizeClass} ${colorClass} ${className}`}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  // Text component
  const textComponent = text ? (
    <p className={`mt-2 ${colorClass}`}>{text}</p>
  ) : null;

  // For centered display
  if (centered) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center">
        {spinner}
        {textComponent}
      </div>
    );
  }

  // For fullscreen overlay
  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75"
        style={{ zIndex: 1050 }}
      >
        {spinner}
        {textComponent}
      </div>
    );
  }

  // Default display
  return (
    <>
      {spinner}
      {textComponent}
    </>
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
  type: PropTypes.oneOf(["border", "grow"]),
  text: PropTypes.string,
  centered: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

export default Loader;
