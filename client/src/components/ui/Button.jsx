import React from "react";
import PropTypes from "prop-types";

/**
 * Button component using Bootstrap classes
 */
const Button = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  // Map our variants to Bootstrap variants
  const variantClass =
    {
      primary: "primary",
      secondary: "secondary",
      outlined: "outline-primary",
      danger: "danger",
      success: "success",
      link: "link",
    }[variant] || "primary";

  // Map sizes to Bootstrap sizes
  const sizeClass =
    {
      small: "sm",
      medium: "", // default, no suffix in Bootstrap
      large: "lg",
    }[size] || "";

  // Combine classes
  const classes = `
    btn 
    ${
      variant === "outlined"
        ? `btn-outline-${variantClass.replace("outline-", "")}`
        : `btn-${variantClass}`
    }
    ${sizeClass ? `btn-${sizeClass}` : ""} 
    ${fullWidth ? "w-100" : ""} 
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outlined",
    "danger",
    "success",
    "link",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
};

export default Button;
