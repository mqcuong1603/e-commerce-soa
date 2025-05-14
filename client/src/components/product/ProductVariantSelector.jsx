import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * ProductVariantSelector component for selecting product variants
 */
const ProductVariantSelector = ({
  variants,
  selectedVariant,
  onVariantChange,
  showPrice,
  layout,
}) => {
  const [selected, setSelected] = useState(null);

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

  // For variants without attributes, just show a simple list
  if (
    !variants[0]?.attributes ||
    Object.keys(variants[0].attributes).length === 0
  ) {
    return (
      <div className="mb-3">
        <h6 className="mb-2">Variants</h6>

        <div className={layout === "grid" ? "row row-cols-2 g-2" : ""}>
          {variants.map((variant) => (
            <div
              key={variant._id}
              className={layout === "grid" ? "col" : "mb-2"}
            >
              <button
                className={`btn w-100 text-start ${
                  selected && selected._id === variant._id
                    ? "btn-outline-danger border-danger"
                    : "btn-outline-secondary"
                } ${variant.inventory <= 0 ? "opacity-50 disabled" : ""}`}
                onClick={() => handleVariantSelect(variant)}
                disabled={variant.inventory <= 0}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{variant.name}</span>

                  {showPrice && (
                    <div>
                      {variant.salePrice ? (
                        <div className="text-end">
                          <span className="text-danger fw-bold">
                            ₫{formatPrice(variant.salePrice)}
                          </span>
                          <span className="text-muted text-decoration-line-through ms-1 small">
                            ₫{formatPrice(variant.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="fw-bold">
                          ₫{formatPrice(variant.price)}
                        </span>
                      )}

                      {variant.inventory <= 0 && (
                        <span className="text-danger small d-block">
                          Out of stock
                        </span>
                      )}
                      {variant.inventory > 0 && variant.inventory <= 5 && (
                        <span className="text-warning small d-block">
                          Only {variant.inventory} left
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For variants with attributes, try to create a more structured selector
  const { primaryAttribute, groups } = getGroupedVariants();

  // Display variants grouped by primary attribute
  if (layout === "buttons" && primaryAttribute) {
    // For simple attributes like size, color, etc. use button-style layout
    return (
      <div className="mb-3">
        <div className="mb-3">
          <h6 className="mb-2 text-capitalize">
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
                  className={`btn ${
                    isSelected ? "btn-danger" : "btn-outline-secondary"
                  } ${!hasAvailable ? "opacity-50 disabled" : ""}`}
                  style={{ minWidth: "4rem" }}
                  onClick={() =>
                    hasAvailable && handleVariantSelect(groups[attrValue][0])
                  }
                  disabled={!hasAvailable}
                >
                  {attrValue}
                </button>
              );
            })}
          </div>
        </div>

        {/* If there are secondary attributes, show them as options after selection */}
        {selected && Object.keys(selected.attributes).length > 1 && (
          <div className="mb-3">
            {Object.keys(selected.attributes)
              .filter((key) => key !== primaryAttribute)
              .map((attrKey) => (
                <div key={attrKey} className="mt-3">
                  <h6 className="mb-2 text-capitalize">
                    {attrKey.replace(/([A-Z])/g, " $1").trim()}
                  </h6>
                  <p>{selected.attributes[attrKey]}</p>
                </div>
              ))}
          </div>
        )}

        {/* Display selected variant info */}
        {selected && showPrice && (
          <div className="mt-3 p-3 bg-light rounded">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-medium">{selected.name}</span>
              <div>
                {selected.salePrice ? (
                  <div>
                    <span className="text-danger fw-bold">
                      ₫{formatPrice(selected.salePrice)}
                    </span>
                    <span className="text-muted text-decoration-line-through ms-1 small">
                      ₫{formatPrice(selected.price)}
                    </span>
                    {calculateDiscount(selected.price, selected.salePrice) && (
                      <span className="ms-1 badge bg-danger">
                        -{calculateDiscount(selected.price, selected.salePrice)}
                        %
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="fw-bold">
                    ₫{formatPrice(selected.price)}
                  </span>
                )}
                {selected.inventory <= 5 && selected.inventory > 0 && (
                  <span className="text-warning small d-block text-end">
                    Only {selected.inventory} left
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default layout for complex variants
  return (
    <div className="mb-3">
      <h6 className="mb-2">Variants</h6>

      <div className="d-flex flex-column gap-2">
        {variants.map((variant) => (
          <button
            key={variant._id}
            className={`btn w-100 text-start ${
              selected && selected._id === variant._id
                ? "btn-outline-danger border-danger"
                : "btn-outline-secondary"
            } ${variant.inventory <= 0 ? "opacity-50 disabled" : ""}`}
            onClick={() => handleVariantSelect(variant)}
            disabled={variant.inventory <= 0}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-medium">{variant.name}</span>
                {variant.attributes &&
                  Object.entries(variant.attributes).length > 0 && (
                    <div className="small text-muted mt-1">
                      {Object.entries(variant.attributes).map(
                        ([key, value], index, array) => (
                          <span key={key}>
                            <span className="text-capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>{" "}
                            {value}
                            {index < array.length - 1 ? ", " : ""}
                          </span>
                        )
                      )}
                    </div>
                  )}
              </div>

              {showPrice && (
                <div>
                  {variant.salePrice ? (
                    <div className="text-end">
                      <span className="text-danger fw-bold">
                        ₫{formatPrice(variant.salePrice)}
                      </span>
                      <span className="text-muted text-decoration-line-through ms-1 small">
                        ₫{formatPrice(variant.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="fw-bold">
                      ₫{formatPrice(variant.price)}
                    </span>
                  )}

                  {variant.inventory <= 0 && (
                    <span className="text-danger small d-block text-end">
                      Out of stock
                    </span>
                  )}
                  {variant.inventory > 0 && variant.inventory <= 5 && (
                    <span className="text-warning small d-block text-end">
                      Only {variant.inventory} left
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
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
