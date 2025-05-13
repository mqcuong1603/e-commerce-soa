import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * ProductVariantSelector component for selecting product variants
 * @param {Object} props - Component props
 * @param {Array} props.variants - Array of product variants
 * @param {Object} props.selectedVariant - Currently selected variant
 * @param {Function} props.onVariantChange - Callback when variant is changed
 * @param {boolean} props.showPrice - Whether to show price information
 * @param {string} props.layout - Layout style ('horizontal', 'vertical', 'grid', 'buttons')
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
      <div
        className={`variant-selector ${
          layout === "vertical" ? "flex flex-col space-y-2" : "space-y-4"
        }`}
      >
        <h3 className="text-sm font-medium text-gray-900 mb-2">Variants</h3>

        <div
          className={layout === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"}
        >
          {variants.map((variant) => (
            <button
              key={variant._id}
              className={`border rounded-md py-2 px-4 text-left w-full transition-colors ${
                selected && selected._id === variant._id
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-300 hover:border-primary-300"
              } ${
                variant.inventory <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              onClick={() => handleVariantSelect(variant)}
              disabled={variant.inventory <= 0}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{variant.name}</span>

                {showPrice && (
                  <div>
                    {variant.salePrice ? (
                      <div className="text-right">
                        <span className="text-red-600 font-semibold">
                          ₫{formatPrice(variant.salePrice)}
                        </span>
                        <span className="text-gray-500 text-sm line-through ml-1">
                          ₫{formatPrice(variant.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold">
                        ₫{formatPrice(variant.price)}
                      </span>
                    )}

                    {variant.inventory <= 0 && (
                      <span className="text-red-600 text-sm block">
                        Out of stock
                      </span>
                    )}
                    {variant.inventory > 0 && variant.inventory <= 5 && (
                      <span className="text-orange-500 text-sm block">
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
  }

  // For variants with attributes, try to create a more structured selector
  const { primaryAttribute, groups } = getGroupedVariants();

  // Display variants grouped by primary attribute
  if (layout === "buttons" && primaryAttribute) {
    // For simple attributes like size, color, etc. use button-style layout
    return (
      <div className="variant-selector">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">
            {primaryAttribute.replace(/([A-Z])/g, " $1").trim()}
          </h3>

          <div className="flex flex-wrap gap-2">
            {Object.keys(groups).map((attrValue) => {
              // Find if any variant in this group is available
              const hasAvailable = groups[attrValue].some(
                (v) => v.inventory > 0
              );
              // Find the first variant in the group
              const firstVariant = groups[attrValue][0];
              // Check if this attribute value is selected
              const isSelected =
                selected &&
                groups[attrValue].some((v) => v._id === selected._id);

              return (
                <button
                  key={attrValue}
                  className={`min-w-[4rem] py-2 px-4 rounded border ${
                    isSelected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 bg-white text-gray-700"
                  } ${
                    !hasAvailable
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-primary-300"
                  }`}
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
          <div className="mb-4">
            {Object.keys(selected.attributes)
              .filter((key) => key !== primaryAttribute)
              .map((attrKey) => (
                <div key={attrKey} className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">
                    {attrKey.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-gray-700">
                    {selected.attributes[attrKey]}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Display selected variant info */}
        {selected && showPrice && (
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">{selected.name}</span>
              <div>
                {selected.salePrice ? (
                  <div>
                    <span className="text-red-600 font-semibold">
                      ₫{formatPrice(selected.salePrice)}
                    </span>
                    <span className="text-gray-500 text-sm line-through ml-1">
                      ₫{formatPrice(selected.price)}
                    </span>
                    {calculateDiscount(selected.price, selected.salePrice) && (
                      <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">
                        -{calculateDiscount(selected.price, selected.salePrice)}
                        %
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-semibold">
                    ₫{formatPrice(selected.price)}
                  </span>
                )}
                {selected.inventory <= 5 && selected.inventory > 0 && (
                  <span className="text-orange-500 text-sm block text-right">
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
    <div className="variant-selector space-y-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Variants</h3>

      <div className="space-y-2">
        {variants.map((variant) => (
          <button
            key={variant._id}
            className={`border rounded-md py-2 px-4 text-left w-full ${
              selected && selected._id === variant._id
                ? "border-primary-600 bg-primary-50"
                : "border-gray-300 hover:border-primary-300"
            } ${
              variant.inventory <= 0
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            onClick={() => handleVariantSelect(variant)}
            disabled={variant.inventory <= 0}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{variant.name}</span>
                {variant.attributes &&
                  Object.entries(variant.attributes).length > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {Object.entries(variant.attributes).map(
                        ([key, value], index, array) => (
                          <span key={key}>
                            <span className="capitalize">
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
                    <div className="text-right">
                      <span className="text-red-600 font-semibold">
                        ₫{formatPrice(variant.salePrice)}
                      </span>
                      <span className="text-gray-500 text-sm line-through ml-1">
                        ₫{formatPrice(variant.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold">
                      ₫{formatPrice(variant.price)}
                    </span>
                  )}

                  {variant.inventory <= 0 && (
                    <span className="text-red-600 text-sm block text-right">
                      Out of stock
                    </span>
                  )}
                  {variant.inventory > 0 && variant.inventory <= 5 && (
                    <span className="text-orange-500 text-sm block text-right">
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
