import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Product Gallery component for displaying product images with elegant styling
 * Features smooth transitions, enhanced zoom capabilities, and intuitive navigation
 */
const ProductGallery = ({ images, mainImage, onImageChange }) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Set initial main image
  useEffect(() => {
    if (mainImage) {
      setCurrentImage(mainImage);
      const index = images.findIndex((img) => img._id === mainImage._id);
      setActiveIndex(index >= 0 ? index : 0);
    } else if (images && images.length > 0) {
      setCurrentImage(images[0]);
      setActiveIndex(0);
    }
    setLoading(false);
  }, [mainImage, images]);

  // Handle thumbnail click
  const handleThumbnailClick = (image, index) => {
    setCurrentImage(image);
    setActiveIndex(index);
    setIsZoomed(false);

    if (onImageChange) {
      onImageChange(image);
    }
  };

  // Navigate to previous/next image
  const navigateImage = (direction) => {
    const newIndex =
      direction === "next"
        ? (activeIndex + 1) % images.length
        : (activeIndex - 1 + images.length) % images.length;

    setActiveIndex(newIndex);
    setCurrentImage(images[newIndex]);
    setIsZoomed(false);

    if (onImageChange) {
      onImageChange(images[newIndex]);
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

  // Render loading state with elegant spinner
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light rounded shadow-sm"
        style={{ height: "460px" }}
      >
        <div
          className="spinner-grow text-danger"
          role="status"
          style={{ width: "3rem", height: "3rem", opacity: "0.7" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Render no images state with elegant placeholder
  if (!images || images.length === 0) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center bg-light rounded shadow-sm h-100"
        style={{ height: "460px", minHeight: "300px" }}
      >
        <i
          className="bi bi-image text-secondary mb-2"
          style={{ fontSize: "3rem", opacity: "0.5" }}
        ></i>
        <span className="text-muted">No images available</span>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Main image with elegant container */}
      <div
        className={`position-relative overflow-hidden rounded shadow-sm mb-3 bg-white ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        style={{
          height: "460px",
          transition: "all 0.3s ease",
        }}
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              className="btn btn-sm position-absolute top-50 start-0 translate-middle-y bg-white bg-opacity-75 rounded-circle p-2 m-2 d-flex align-items-center justify-content-center shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
              style={{
                zIndex: 10,
                width: "40px",
                height: "40px",
                opacity: 0.8,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseOut={(e) => (e.currentTarget.style.opacity = 0.8)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <button
              className="btn btn-sm position-absolute top-50 end-0 translate-middle-y bg-white bg-opacity-75 rounded-circle p-2 m-2 d-flex align-items-center justify-content-center shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
              style={{
                zIndex: 10,
                width: "40px",
                height: "40px",
                opacity: 0.8,
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseOut={(e) => (e.currentTarget.style.opacity = 0.8)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </>
        )}

        {currentImage ? (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-25">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.alt || "Product"}
              className="h-100 w-100 object-fit-contain p-3"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                transformOrigin: isZoomed
                  ? `${zoomPosition.x}% ${zoomPosition.y}%`
                  : "center center",
                transform: isZoomed ? "scale(2)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        ) : (
          <div className="bg-light h-100 w-100 d-flex align-items-center justify-content-center">
            <span className="text-muted">No image available</span>
          </div>
        )}

        {/* Zoom indicator with elegant styling */}
        <div
          className="position-absolute top-0 end-0 m-3 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{
            width: "40px",
            height: "40px",
            opacity: isZoomed ? 0.9 : 0.7,
            transition: "opacity 0.2s ease",
          }}
        >
          <i
            className={`bi ${
              isZoomed ? "bi-zoom-out" : "bi-zoom-in"
            } text-secondary`}
          ></i>
        </div>

        {/* Image info badge */}
        <div className="position-absolute bottom-0 start-0 m-3">
          <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
            <i className="bi bi-image me-1"></i>
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnails with elegant scrollable container */}
      {images.length > 1 && (
        <div className="position-relative">
          <div
            className="d-flex flex-nowrap overflow-auto pb-2 px-2 thumbnails-container"
            style={{
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {images.map((image, index) => (
              <div
                key={image._id}
                className="flex-shrink-0 mx-1"
                onClick={() => handleThumbnailClick(image, index)}
              >
                <div
                  className={`border rounded p-1 d-flex align-items-center justify-content-center bg-white shadow-sm ${
                    activeIndex === index ? "border-danger" : "border-light"
                  }`}
                  style={{
                    cursor: "pointer",
                    width: "70px",
                    height: "70px",
                    opacity: activeIndex === index ? 1 : 0.7,
                    transition: "all 0.2s ease",
                    transform:
                      activeIndex === index
                        ? "translateY(-5px)"
                        : "translateY(0)",
                  }}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.alt || `Product view ${index + 1}`}
                    className="mh-100 mw-100 object-fit-contain"
                  />
                </div>
                {activeIndex === index && (
                  <div className="mt-1 d-flex justify-content-center">
                    <div
                      className="bg-danger rounded-pill"
                      style={{ width: "6px", height: "6px" }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom scrollbar indicator */}
          <div className="d-flex justify-content-center mt-2">
            <div
              className="bg-light rounded-pill"
              style={{ width: "100px", height: "4px" }}
            >
              <div
                className="bg-danger rounded-pill"
                style={{
                  width: `${100 / images.length}px`,
                  height: "100%",
                  transform: `translateX(${
                    activeIndex * (100 / images.length)
                  }px)`,
                  transition: "transform 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Elegant image badge indicators for small screens */}
      <div className="d-md-none d-flex justify-content-center mt-3">
        {images.length > 1 &&
          images.map((_, index) => (
            <span
              key={index}
              onClick={() => handleThumbnailClick(images[index], index)}
              className={`mx-1 rounded-circle ${
                activeIndex === index
                  ? "bg-danger"
                  : "bg-secondary bg-opacity-25"
              }`}
              style={{
                cursor: "pointer",
                width: "8px",
                height: "8px",
                transition: "all 0.2s ease",
              }}
            ></span>
          ))}
      </div>

      <style jsx>{`
        .thumbnails-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
