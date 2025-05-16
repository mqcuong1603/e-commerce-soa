import React, { useState, useRef } from "react";
import { Button, Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import adminService from "../../../services/admin.service";
import { toast } from "react-toastify";

const ImagesManager = ({ productId, images, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large. Maximum size is 2MB.`);
          continue;
        }

        // Upload the image
        const formData = {
          file,
          isMain: images.length === 0, // First image is main by default
        };

        const result = await adminService.uploadProductImage(
          productId,
          formData
        );

        if (result.success) {
          onChange([...images, result.data]);
          toast.success("Image uploaded successfully");
        } else {
          toast.error(result.message || "Failed to upload image");
        }
      }

      // Reset the file input
      e.target.value = "";
    } catch (err) {
      console.error("Error uploading images:", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const result = await adminService.deleteProductImage(productId, imageId);

      if (result.success) {
        onChange(images.filter((img) => img._id !== imageId));
        toast.success("Image deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete image");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error("Failed to delete image");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      // Local update first for better UX
      const updatedImages = images.map((img) => ({
        ...img,
        isMain: img._id === imageId,
      }));

      onChange(updatedImages);

      // Update on server
      const formData = {
        isMain: true,
      };

      const result = await adminService.updateProductImage(
        productId,
        imageId,
        formData
      );

      if (!result.success) {
        // Revert changes if failed
        toast.error(result.message || "Failed to set as main image");
        onChange(images);
      }
    } catch (err) {
      console.error("Error setting main image:", err);
      toast.error("Failed to set as main image");
      onChange(images); // Revert changes
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Product Images</h5>
        <Button
          variant="primary"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Uploading...
            </>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up me-2"></i>
              Upload Images
            </>
          )}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="d-none"
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {images.length === 0 ? (
        <Card className="text-center p-5 bg-light">
          <div className="py-5">
            <div className="d-inline-block p-3 bg-white rounded-circle mb-3">
              <i
                className="bi bi-image text-muted"
                style={{ fontSize: "48px" }}
              ></i>
            </div>
            <h5 className="fw-bold">No Images Yet</h5>
            <p className="text-muted mb-4">
              Upload product images to enhance your product listing
            </p>
            <Button variant="primary" onClick={handleUploadClick}>
              <i className="bi bi-cloud-arrow-up me-2"></i>
              Upload First Image
            </Button>
          </div>
        </Card>
      ) : (
        <Row className="g-4">
          {images.map((image) => (
            <Col key={image._id} xs={6} md={4} lg={3}>
              <Card className={`h-100 ${image.isMain ? "border-primary" : ""}`}>
                <div
                  style={{
                    height: "150px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.alt || "Product image"}
                    className="img-fluid h-100 w-100 object-fit-cover"
                  />
                  {image.isMain && (
                    <span className="badge bg-primary position-absolute top-0 start-0 m-2">
                      Main
                    </span>
                  )}
                </div>
                <Card.Footer className="d-flex justify-content-between align-items-center p-2">
                  {!image.isMain && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSetMainImage(image._id)}
                      title="Set as main image"
                    >
                      <i className="bi bi-star"></i>
                    </Button>
                  )}
                  {image.isMain && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled
                      title="Main image"
                    >
                      <i className="bi bi-star-fill"></i>
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteImage(image._id)}
                    title="Delete image"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ImagesManager;
