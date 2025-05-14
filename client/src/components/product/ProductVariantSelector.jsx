import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * ProductVariantSelector component for selecting product variants
 * Enhanced with elegant Bootstrap 5 styling and smooth transitions
 */
const ProductVariantSelector = ({
  variants,
  selectedVariant,
  onVariantChange,
  showPrice,
  layout,
}) => {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  // Set initial selected variant
  useEffect(() => {
    if (selectedVariant) {
      setSelected(selectedVariant);
    } else if (variants && variants.length > 0) {
      // Select first available variant
      const availableVariant =
        variants.find((v) => v.inventory > 0) || variants[0];
      setSelected(availableVariant);
      if (onVariantChange) {
        onVariantChange(availableVariant);
      }
    }
  }, [selectedVariant, variants, onVariantChange]);

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "";
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    if (variant.inventory <= 0) return; // Prevent selecting out-of-stock variants

    setSelected(variant);

    if (onVariantChange) {
      onVariantChange(variant);
    }
  };

  // Calculate discount percentage
  const calculateDiscount = (price, salePrice) => {
    if (salePrice && price && salePrice < price) {
      const discount = ((price - salePrice) / price) * 100;
      return Math.round(discount);
    }
    return null;
  };

  // Group variants by attribute if needed
  const getGroupedVariants = () => {
    if (!variants || variants.length === 0) return {};

    // Get primary attribute for grouping
    const attributeKeys = variants[0]?.attributes
      ? Object.keys(variants[0].attributes)
      : [];
    if (attributeKeys.length === 0) return {};

    const primaryAttribute = attributeKeys[0];

    // Group variants by primary attribute
    const grouped = {};
    variants.forEach((variant) => {
      if (variant.attributes && variant.attributes[primaryAttribute]) {
        const attrValue = variant.attributes[primaryAttribute];
        if (!grouped[attrValue]) {
          grouped[attrValue] = [];
        }
        grouped[attrValue].push(variant);
      }
    });

    return { primaryAttribute, groups: grouped };
  };

  // If no variants are provided, return null
  if (!variants || variants.length === 0) {
    return null;
  }

  // For variants without attributes, display a simple elegant list
  if (
    !variants[0]?.attributes ||
    Object.keys(variants[0].attributes).length === 0
  ) {
    return (
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2">Variants</h6>

        <div className={layout === "grid" ? "row row-cols-2 g-3" : ""}>
          {variants.map((variant) => {
            const isSelected = selected && selected._id === variant._id;
            const isOutOfStock = variant.inventory <= 0;
            const isLowStock = variant.inventory > 0 && variant.inventory <= 5;

            return (
              <div
                key={variant._id}
                className={layout === "grid" ? "col" : "mb-2"}
                onMouseEnter={() => setHovered(variant._id)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  className={`btn w-100 text-start shadow-sm transition-all p-3 ${
                    isSelected
                      ? "btn-danger text-white border-0"
                      : "btn-outline-secondary border-1"
                  } ${isOutOfStock ? "opacity-50 disabled" : ""} ${
                    hovered === variant._id && !isOutOfStock && !isSelected
                      ? "shadow border-danger border-opacity-25"
                      : ""
                  }`}
                  style={{
                    transition: "all 0.2s ease",
                    borderWidth: isSelected ? "2px" : "1px",
                    transform:
                      hovered === variant._id && !isOutOfStock && !isSelected
                        ? "translateY(-2px)"
                        : "translateY(0)",
                  }}
                  onClick={() => handleVariantSelect(variant)}
                  disabled={isOutOfStock}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={isSelected ? "fw-bold" : "fw-normal"}>
                      {variant.name}
                    </span>

                    {showPrice && (
                      <div>
                        {variant.salePrice ? (
                          <div className="text-end">
                            <span
                              className={`fw-bold ${
                                isSelected ? "text-white" : "text-danger"
                              }`}
                            >
                              ₫{formatPrice(variant.salePrice)}
                            </span>
                            <span
                              className={`text-decoration-line-through ms-2 small ${
                                isSelected
                                  ? "text-white text-opacity-75"
                                  : "text-muted"
                              }`}
                            >
                              ₫{formatPrice(variant.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="fw-bold">
                            ₫{formatPrice(variant.price)}
                          </span>
                        )}

                        {isOutOfStock && (
                          <div className="mt-1 d-flex align-items-center justify-content-end">
                            <i className="bi bi-x-circle-fill me-1 text-danger"></i>
                            <span
                              className={`small ${
                                isSelected ? "text-white" : "text-danger"
                              }`}
                            >
                              Out of stock
                            </span>
                          </div>
                        )}

                        {isLowStock && (
                          <div className="mt-1 d-flex align-items-center justify-content-end">
                            <i className="bi bi-exclamation-triangle-fill me-1 text-warning"></i>
                            <span
                              className={`small ${
                                isSelected ? "text-white" : "text-warning"
                              }`}
                            >
                              Only {variant.inventory} left
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For variants with attributes, using a beautiful button selector
  const { primaryAttribute, groups } = getGroupedVariants();

  // Display variants grouped by primary attribute as elegant buttons
  if (layout === "buttons" && primaryAttribute) {
    return (
      <div className="mb-4">
        <div className="mb-4">
          <h6 className="fw-bold mb-3 text-capitalize border-bottom pb-2">
            {primaryAttribute.replace(/([A-Z])/g, " $1").trim()}
          </h6>

          <div className="d-flex flex-wrap gap-2">
            {Object.keys(groups).map((attrValue) => {
              // Find if any variant in this group is available
              const hasAvailable = groups[attrValue].some(
                (v) => v.inventory > 0
              );
              // Check if this attribute value is selected
              const isSelected =
                selected &&
                groups[attrValue].some((v) => v._id === selected._id);

              return (
                <button
                  key={attrValue}
                  className={`btn position-relative ${
                    isSelected
                      ? "btn-danger shadow-sm"
                      : "btn-outline-secondary"
                  } ${!hasAvailable ? "opacity-50 disabled" : ""}`}
                  style={{
                    minWidth: "4rem",
                    transition: "all 0.2s ease",
                    transform: isSelected
                      ? "translateY(-2px)"
                      : "translateY(0)",
                  }}
                  onClick={() =>
                    hasAvailable && handleVariantSelect(groups[attrValue][0])
                  }
                  disabled={!hasAvailable}
                >
                  {!hasAvailable && (
                    <i
                      className="bi bi-slash-circle position-absolute top-0 end-0 text-danger translate-middle"
                      style={{ fontSize: "0.75rem" }}
                    ></i>
                  )}
                  {attrValue}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary attributes with elegant styling */}
        {selected && Object.keys(selected.attributes).length > 1 && (
          <div className="mb-4 card border-0 shadow-sm">
            <div className="card-body">
              {Object.keys(selected.attributes)
                .filter((key) => key !== primaryAttribute)
                .map((attrKey) => (
                  <div key={attrKey} className="mb-2 last-mb-0">
                    <div className="row align-items-center">
                      <div className="col-5 col-md-4 text-secondary">
                        <span className="text-capitalize">
                          {attrKey.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                      </div>
                      <div className="col-7 col-md-8 fw-medium">
                        {selected.attributes[attrKey]}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Display selected variant info with elegant card */}
        {selected && showPrice && (
          <div className="mt-3 card border-0 bg-light shadow-sm rounded">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-medium d-block mb-1">
                    {selected.name}
                  </span>
                  {selected.inventory > 0 && (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                      <i className="bi bi-check2-circle me-1"></i>
                      In Stock
                    </span>
                  )}
                </div>

                <div className="text-end">
                  {selected.salePrice ? (
                    <div>
                      <div className="d-flex flex-column align-items-end">
                        <span className="text-danger fw-bold fs-5">
                          ₫{formatPrice(selected.salePrice)}
                        </span>
                        <span className="text-muted text-decoration-line-through small">
                          ₫{formatPrice(selected.price)}
                        </span>
                      </div>
                      {calculateDiscount(
                        selected.price,
                        selected.salePrice
                      ) && (
                        <span className="ms-2 badge bg-danger rounded-pill">
                          -
                          {calculateDiscount(
                            selected.price,
                            selected.salePrice
                          )}
                          %
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="fw-bold fs-5">
                      ₫{formatPrice(selected.price)}
                    </span>
                  )}

                  {selected.inventory <= 5 && selected.inventory > 0 && (
                    <div className="mt-1 text-warning small">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      Only {selected.inventory} left
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default layout for complex variants with elegant cards
  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3 border-bottom pb-2">Variants</h6>

      <div className="d-flex flex-column gap-3">
        {variants.map((variant) => {
          const isSelected = selected && selected._id === variant._id;
          const isOutOfStock = variant.inventory <= 0;

          return (
            <button
              key={variant._id}
              className={`btn w-100 text-start p-0 overflow-hidden ${
                isOutOfStock ? "opacity-75 disabled" : ""
              }`}
              style={{
                transition: "all 0.3s ease",
                border: "none",
              }}
              onClick={() => handleVariantSelect(variant)}
              disabled={isOutOfStock}
            >
              <div
                className={`p-3 rounded shadow-sm ${
                  isSelected
                    ? "bg-danger bg-opacity-10 border border-danger"
                    : "bg-white border"
                }`}
                style={{ transition: "all 0.3s ease" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span
                      className={`${
                        isSelected ? "fw-bold text-danger" : "fw-medium"
                      }`}
                    >
                      {variant.name}
                    </span>

                    {variant.attributes &&
                      Object.entries(variant.attributes).length > 0 && (
                        <div className="mt-2 small">
                          {Object.entries(variant.attributes).map(
                            ([key, value], index, array) => (
                              <span
                                key={key}
                                className={`badge me-2 ${
                                  isSelected
                                    ? "bg-danger bg-opacity-10 text-danger"
                                    : "bg-light text-secondary"
                                }`}
                                style={{ fontWeight: "normal" }}
                              >
                                <span className="text-capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}:
                                </span>{" "}
                                <span className="fw-medium">{value}</span>
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>

                  {showPrice && (
                    <div className="ms-3 text-end">
                      {variant.salePrice ? (
                        <div>
                          <span
                            className={`fw-bold ${
                              isSelected ? "text-danger" : ""
                            }`}
                          >
                            ₫{formatPrice(variant.salePrice)}
                          </span>
                          <div className="text-muted text-decoration-line-through small">
                            ₫{formatPrice(variant.price)}
                          </div>
                          {calculateDiscount(
                            variant.price,
                            variant.salePrice
                          ) && (
                            <span className="ms-1 badge bg-danger rounded-pill">
                              -
                              {calculateDiscount(
                                variant.price,
                                variant.salePrice
                              )}
                              %
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="fw-bold">
                          ₫{formatPrice(variant.price)}
                        </span>
                      )}

                      {isOutOfStock && (
                        <div className="mt-1 text-danger small">
                          <i className="bi bi-x-circle-fill me-1"></i>
                          Out of stock
                        </div>
                      )}

                      {variant.inventory > 0 && variant.inventory <= 5 && (
                        <div className="mt-1 text-warning small">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          Only {variant.inventory} left
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

ProductVariantSelector.propTypes = {
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      salePrice: PropTypes.number,
      inventory: PropTypes.number.isRequired,
      attributes: PropTypes.object,
    })
  ).isRequired,
  selectedVariant: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    salePrice: PropTypes.number,
    inventory: PropTypes.number.isRequired,
    attributes: PropTypes.object,
  }),
  onVariantChange: PropTypes.func,
  showPrice: PropTypes.bool,
  layout: PropTypes.oneOf(["horizontal", "vertical", "grid", "buttons"]),
};

ProductVariantSelector.defaultProps = {
  showPrice: true,
  layout: "vertical",
  onVariantChange: () => {},
};

export default ProductVariantSelector;
