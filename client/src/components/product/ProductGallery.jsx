import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Product Gallery component for displaying product images with thumbnails
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of product images
 * @param {Object} props.mainImage - Currently selected main image
 * @param {Function} props.onImageChange - Callback when image is changed
 */
const ProductGallery = ({ images, mainImage, onImageChange }) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // Set initial main image
  useEffect(() => {
    if (mainImage) {
      setCurrentImage(mainImage);
    } else if (images && images.length > 0) {
      setCurrentImage(images[0]);
    }
    setLoading(false);
  }, [mainImage, images]);

  // Handle thumbnail click
  const handleThumbnailClick = (image) => {
    setCurrentImage(image);
    if (onImageChange) {
      onImageChange(image);
    }
  };

  // Handle zoom in/out
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (isZoomed) {
      setIsZoomed(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Render no images state
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 h-96 flex items-center justify-center rounded-lg">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Main image */}
      <div
        className={`relative overflow-hidden border rounded-lg bg-white mb-4 ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        style={{ height: "500px" }}
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {currentImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.alt || "Product"}
              className={`max-h-full max-w-full object-contain transition-transform duration-200 ${
                isZoomed ? "scale-150" : ""
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />
          </div>
        ) : (
          <div className="bg-gray-200 h-full w-full flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}

        {/* Zoom indicator */}
        {!isZoomed && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-70 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image) => (
            <div
              key={image._id}
              className={`border rounded-md overflow-hidden cursor-pointer h-20 bg-white p-1 flex items-center justify-center transition-colors ${
                currentImage && currentImage._id === image._id
                  ? "border-primary-600"
                  : "border-gray-200 hover:border-primary-300"
              }`}
              onClick={() => handleThumbnailClick(image)}
            >
              <img
                src={image.imageUrl}
                alt={image.alt || "Product thumbnail"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* Image counter */}
      <div className="mt-2 text-sm text-gray-500 text-center">
        Image{" "}
        {currentImage
          ? images.findIndex((img) => img._id === currentImage._id) + 1
          : 1}{" "}
        of {images.length}
      </div>
    </div>
  );
};

ProductGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      isMain: PropTypes.bool,
      alt: PropTypes.string,
    })
  ),
  mainImage: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    isMain: PropTypes.bool,
    alt: PropTypes.string,
  }),
  onImageChange: PropTypes.func,
};

ProductGallery.defaultProps = {
  images: [],
  mainImage: null,
  onImageChange: () => {},
};

export default ProductGallery;
