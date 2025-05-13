import React from "react";
import PropTypes from "prop-types";

/**
 * Card component for displaying content in a card layout
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hoverable - Whether to add hover effect
 * @param {string} props.padding - Padding size ('none', 'small', 'medium', 'large')
 * @param {boolean} props.shadow - Whether to add shadow
 * @param {string} props.border - Border style ('none', 'thin', 'thick')
 * @param {string} props.rounded - Border radius ('none', 'sm', 'md', 'lg', 'full')
 * @param {Function} props.onClick - Card click handler
 */
const Card = ({
  children,
  className = "",
  hoverable = false,
  padding = "medium",
  shadow = true,
  border = "thin",
  rounded = "md",
  onClick = null,
}) => {
  // Padding classes
  const paddingClasses = {
    none: "p-0",
    small: "p-2",
    medium: "p-4",
    large: "p-6",
  };

  // Shadow classes
  const shadowClasses = {
    true: "shadow-md",
    false: "",
  };

  // Border classes
  const borderClasses = {
    none: "border-0",
    thin: "border border-gray-200",
    thick: "border-2 border-gray-300",
  };

  // Rounded corner classes
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Hoverable effect
  const hoverableClass = hoverable
    ? "transition duration-200 hover:shadow-lg"
    : "";

  // Clickable cursor
  const clickableClass = onClick ? "cursor-pointer" : "";

  // Combine all classes
  const combinedClasses = `bg-white ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses[border]} ${roundedClasses[rounded]} ${hoverableClass} ${clickableClass} ${className}`;

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  padding: PropTypes.oneOf(["none", "small", "medium", "large"]),
  shadow: PropTypes.bool,
  border: PropTypes.oneOf(["none", "thin", "thick"]),
  rounded: PropTypes.oneOf(["none", "sm", "md", "lg", "full"]),
  onClick: PropTypes.func,
};

export default Card;
