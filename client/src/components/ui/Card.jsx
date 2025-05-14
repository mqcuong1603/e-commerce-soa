import React from "react";
import PropTypes from "prop-types";

/**
 * Card component built with Bootstrap
 */
const Card = ({
  children,
  className = "",
  title,
  subtitle,
  footer,
  headerClass = "",
  bodyClass = "",
  footerClass = "",
  hoverable = false,
  onClick = null,
}) => {
  const cardClasses = `
    card 
    ${hoverable ? "shadow-sm hover-shadow" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={hoverable ? { transition: "box-shadow .3s ease-in-out" } : {}}
    >
      {title && (
        <div className={`card-header ${headerClass}`}>
          {typeof title === "string" ? (
            <h5 className="card-title mb-0">{title}</h5>
          ) : (
            title
          )}
          {subtitle && (
            <h6 className="card-subtitle text-muted mt-1">{subtitle}</h6>
          )}
        </div>
      )}

      <div className={`card-body ${bodyClass}`}>{children}</div>

      {footer && <div className={`card-footer ${footerClass}`}>{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  footer: PropTypes.node,
  headerClass: PropTypes.string,
  bodyClass: PropTypes.string,
  footerClass: PropTypes.string,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Card;
