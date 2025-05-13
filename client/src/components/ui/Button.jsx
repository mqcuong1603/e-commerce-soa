import React from "react";
import PropTypes from "prop-types";

/**
 * Button component with multiple variants
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
  const baseClasses =
    "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary:
      "bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500",
    outlined:
      "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    link: "bg-transparent text-primary-600 hover:text-primary-800 underline p-0",
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  const classes = `
    ${baseClasses} 
    ${variantClasses[variant] || variantClasses.primary} 
    ${sizeClasses[size] || sizeClasses.medium} 
    ${widthClass} 
    ${disabledClass} 
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
