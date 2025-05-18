import React, { useState, useRef } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  Form,
  Badge,
  Modal,
} from "react-bootstrap";
import adminService from "../../../services/admin.service";
import { toast } from "react-toastify";

const ImagesManager = ({ productId, images, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)]; // One ref for each slot

  const handleUploadClick = (slotIndex) => {
    fileInputRefs[slotIndex].current.click();
  };

  const handleFileChange = async (e, slotIndex) => {
    let file = e.target.files[0]; // Changed from const to let

    if (!file) return;

    try {
      setUploading(true);
      setError(null); // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum size is 2MB.`);
        return;
      } // Check if this would be the first image
      const isFirstImage = images.length === 0;

      // Create proper FormData object for file upload
      const formData = new FormData();

      // Make sure the file has a name - some browsers or environments might have issues
      if (!file.name) {
        const fileType = file.type ? file.type.split("/")[1] || "jpg" : "jpg";
        const blob = file.slice(0, file.size, file.type || "image/jpeg");
        file = new File([blob], `upload-${Date.now()}.${fileType}`, {
          type: file.type || "image/jpeg",
        });
        console.log("Created file with name:", file.name);
      } // Create clean FormData for the upload
      formData.append("image", file);
      formData.append("isMain", isFirstImage ? "true" : "false");

      console.log("Preparing to upload file:", file.name, "Size:", file.size);
      console.log("Sending upload request to server...");
      const result = await adminService.uploadProductImage(productId, formData);
      console.log("Server response:", result);

      if (result.success) {
        onChange([...images, result.data]);
        toast.success("Image uploaded successfully");
      } else {
        console.error("Upload failed with error:", result.message);
        setError(result.message || "Failed to upload image");
        toast.error(result.message || "Failed to upload image");
      }

      // Reset the file input
      e.target.value = "";
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(`Failed to upload image: ${err.message}`);
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
      const formData = { isMain: true };
      const result = await adminService.updateProductImage(
        productId,
        imageId,
        formData
      );

      if (!result.success) {
        // Revert local change on failure
        toast.error("Failed to set main image");
        onChange(images);
      }
    } catch (err) {
      console.error("Error setting main image:", err);
      toast.error("Failed to set main image");
      // Revert local change
      onChange(images);
    }
  };

  const handleUpdateImageAlt = async (imageId, altText) => {
    try {
      // Local update first for better UX
      const updatedImages = images.map((img) => {
        if (img._id === imageId) {
          return { ...img, alt: altText };
        }
        return img;
      });

      onChange(updatedImages);

      // Update on server
      const formData = { alt: altText };
      const result = await adminService.updateProductImage(
        productId,
        imageId,
        formData
      );

      if (!result.success) {
        toast.error("Failed to update image description");
        onChange(images); // Revert on failure
      }
    } catch (err) {
      console.error("Error updating image alt text:", err);
      toast.error("Failed to update image description");
      onChange(images);
    }
  };

  // Image preview
  const openImagePreview = (image) => {
    setPreviewImage(image);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  // Create array of 3 slots - filled with images or empty
  const imageSlots = Array(3)
    .fill(null)
    .map((_, index) => (index < images.length ? images[index] : null));

  return (
    <div>
      <div className="mb-4">
        <Card className="shadow border-0">
          <Card.Header className="bg-white border-bottom border-light py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-images text-primary me-2"></i>
                Product Images
                <Badge bg="secondary" pill className="ms-2">
                  {images.length}/3
                </Badge>
              </h5>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}

            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              You can upload up to 3 images per product. The first image will be
              the main product image.
            </Alert>

            {uploading && (
              <div className="text-center my-4 p-4 border rounded bg-light">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 mb-0 text-primary">Uploading image...</p>
              </div>
            )}

            <Row className="g-4">
              {imageSlots.map((image, index) => (
                <Col md={4} key={index}>
                  {image ? (
                    // Image slot with uploaded image
                    <Card className="h-100 shadow-hover">
                      <div className="position-relative">
                        <div
                          className="image-container"
                          onClick={() => openImagePreview(image)}
                        >
                          <Card.Img
                            variant="top"
                            src={image.imageUrl}
                            alt={image.alt || "Product image"}
                            style={{
                              height: "180px",
                              objectFit: "contain",
                              padding: "12px",
                              background: "#f8f9fa",
                              cursor: "pointer",
                            }}
                          />
                        </div>

                        {image.isMain && (
                          <Badge
                            bg="primary"
                            className="position-absolute top-0 start-0 m-2 px-2 py-1"
                          >
                            <i className="bi bi-star-fill me-1"></i>
                            Main Image
                          </Badge>
                        )}
                      </div>

                      <Card.Body className="p-3">
                        <Form.Control
                          size="sm"
                          type="text"
                          placeholder="Image description"
                          value={image.alt || ""}
                          onChange={(e) =>
                            handleUpdateImageAlt(image._id, e.target.value)
                          }
                          className="mb-3"
                        />

                        <div className="d-flex gap-2 justify-content-between">
                          {!image.isMain && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleSetMainImage(image._id)}
                            >
                              <i className="bi bi-star me-1"></i>
                              Set as Main
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-auto"
                            onClick={() => handleDeleteImage(image._id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Remove
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    // Empty image slot
                    <Card
                      className="h-100 d-flex align-items-center justify-content-center border-dashed bg-light"
                      style={{ minHeight: "250px" }}
                    >
                      <Card.Body className="text-center">
                        <div className="mb-3">
                          <i
                            className="bi bi-image text-secondary"
                            style={{ fontSize: "48px" }}
                          ></i>
                        </div>
                        <h6 className="text-muted mb-3">
                          Image Slot {index + 1}
                        </h6>
                        <Button
                          variant="primary"
                          onClick={() => handleUploadClick(index)}
                          disabled={uploading || images.length >= 3}
                        >
                          <i className="bi bi-upload me-2"></i>
                          Upload Image
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRefs[index]}
                          className="d-none"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, index)}
                        />
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              ))}
            </Row>

            {images.length === 0 && (
              <Alert variant="warning" className="mt-4">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                Please upload at least one product image. The first image will
                automatically be set as the main image.
              </Alert>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Image Preview Modal */}
      <Modal
        show={previewImage !== null}
        onHide={closeImagePreview}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{previewImage?.alt || "Product Image"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 text-center">
          {previewImage && (
            <img
              src={previewImage.imageUrl}
              alt={previewImage.alt || "Product image"}
              className="img-fluid"
              style={{ maxHeight: "70vh" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImagePreview}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .shadow-hover {
          transition: all 0.2s ease;
        }
        .shadow-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .border-dashed {
          border: 2px dashed #dee2e6 !important;
        }
        .image-container {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default ImagesManager;
