import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Product Gallery component for displaying product images with thumbnails
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
      <div
        className="d-flex justify-content-center align-items-center bg-light"
        style={{ height: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render no images state
  if (!images || images.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light rounded"
        style={{ height: "400px" }}
      >
        <span className="text-muted">No images available</span>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Main image */}
      <div
        className={`position-relative overflow-hidden border rounded mb-3 bg-white ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        style={{ height: "400px" }}
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {currentImage ? (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.alt || "Product"}
              className={`max-h-100 object-fit-contain transition ${
                isZoomed ? "transform-scale-150" : ""
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform: "scale(1.5)",
                      transition: "transform 0.2s",
                    }
                  : { transition: "transform 0.2s" }
              }
            />
          </div>
        ) : (
          <div className="bg-light h-100 w-100 d-flex align-items-center justify-content-center">
            <span className="text-muted">No image available</span>
          </div>
        )}

        {/* Zoom indicator */}
        {!isZoomed && (
          <div className="position-absolute top-0 end-0 m-2 bg-white bg-opacity-75 p-2 rounded-circle">
            <i className="bi bi-zoom-in text-secondary"></i>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="row row-cols-5 g-2">
          {images.map((image) => (
            <div
              key={image._id}
              className="col"
              onClick={() => handleThumbnailClick(image)}
            >
              <div
                className={`border rounded p-1 h-100 d-flex align-items-center justify-content-center bg-white ${
                  currentImage && currentImage._id === image._id
                    ? "border-danger"
                    : "border-secondary"
                }`}
                style={{ cursor: "pointer", height: "70px" }}
              >
                <img
                  src={image.imageUrl}
                  alt={image.alt || "Product thumbnail"}
                  className="mh-100 mw-100 object-fit-contain"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image counter */}
      <div className="mt-2 text-center small text-muted">
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
