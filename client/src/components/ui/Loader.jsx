import React from "react";
import PropTypes from "prop-types";

/**
 * Loader component using Bootstrap spinners
 */
const Loader = ({
  color = "primary",
  size = "md",
  text = "Loading...",
  centered = false,
}) => {
  const sizeMap = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg",
  };

  return (
    <div className={`${centered ? "text-center" : ""}`}>
      <div
        className={`spinner-border text-${color} ${sizeMap[size]}`}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2">{text}</p>}
    </div>
  );
};

Loader.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  text: PropTypes.string,
  centered: PropTypes.bool,
};

export default Loader;
