import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  Form,
  Badge,
  Tabs,
  Tab,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  Container,
  Modal,
} from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import adminService from "../../../services/admin.service";
import { toast } from "react-toastify";

const ImagesManager = ({ productId, images, onChange, variants = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'product', 'variant'
  const [activeTab, setActiveTab] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);
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

      // Calculate if this would be the first image for product or variant
      const isFirstImage = selectedVariant
        ? !images.some((img) => img.variantId === selectedVariant)
        : images.filter((img) => !img.variantId).length === 0;

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
          isMain: isFirstImage && i === 0, // First image is main by default for its context
          variantId: selectedVariant || undefined,
        };

        const result = await adminService.uploadProductImage(
          productId,
          formData
        );

        if (result.success) {
          onChange([...images, result.data]);
          toast.success(
            `Image uploaded successfully${
              selectedVariant ? " for variant" : ""
            }`
          );
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

  // Helper function for future implementation of linking/unlinking images to variants
  const handleUpdateImageVariant = async (imageId, variantId) => {
    try {
      // Local update first for better UX
      const updatedImages = images.map((img) => {
        if (img._id === imageId) {
          return { ...img, variantId: variantId || null };
        }
        return img;
      });

      onChange(updatedImages);

      // Update on server
      const formData = { variantId: variantId || null };
      const result = await adminService.updateProductImage(
        productId,
        imageId,
        formData
      );

      if (!result.success) {
        toast.error("Failed to update image variant association");
        onChange(images); // Revert on failure
      } else {
        toast.success(
          variantId ? "Image linked to variant" : "Image unlinked from variant"
        );
      }
    } catch (err) {
      console.error("Error updating image variant:", err);
      toast.error("Failed to update image variant association");
      onChange(images);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update locally
    onChange(
      items.map((item, index) => ({
        ...item,
        sortOrder: index,
      }))
    );

    // Update on server (would need API endpoint to update image sort order)
    try {
      // Implement server update for sort order if API supports it
      toast.success("Image order updated");
    } catch (err) {
      console.error("Error updating image order:", err);
      toast.error("Failed to update image order");
    }
  };

  // Effect to reset selected variant when view mode changes
  useEffect(() => {
    if (viewMode === "product") {
      setSelectedVariant(null);
    }
  }, [viewMode]);

  // Calculate image groupings
  const productImages = images.filter((img) => !img.variantId);
  const variantImagesMap = {};

  variants.forEach((variant) => {
    variantImagesMap[variant._id] = images.filter(
      (img) => img.variantId === variant._id
    );
  });

  // Filter images based on the selected view
  const filteredImages = (() => {
    if (viewMode === "product") {
      return productImages;
    } else if (viewMode === "variant" && selectedVariant) {
      return variantImagesMap[selectedVariant] || [];
    } else {
      // For 'all' mode or when no specific selection is made
      return selectedVariant
        ? [...productImages, ...(variantImagesMap[selectedVariant] || [])]
        : images;
    }
  })();

  // Image preview
  const openImagePreview = (image) => {
    setPreviewImage(image);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

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
                  {images.length}
                </Badge>
                {productImages.length > 0 && (
                  <Badge bg="info" pill className="ms-1">
                    {productImages.length} Product
                  </Badge>
                )}
                {Object.values(variantImagesMap).flat().length > 0 && (
                  <Badge bg="primary" pill className="ms-1">
                    {Object.values(variantImagesMap).flat().length} Variant
                  </Badge>
                )}
              </h5>
              <div className="d-flex gap-2">
                <ButtonGroup size="sm">
                  <Button
                    variant={viewMode === "all" ? "primary" : "outline-primary"}
                    onClick={() => setViewMode("all")}
                  >
                    <i className="bi bi-grid-3x3 me-1"></i> All
                  </Button>
                  <Button
                    variant={
                      viewMode === "product" ? "primary" : "outline-primary"
                    }
                    onClick={() => setViewMode("product")}
                  >
                    <i className="bi bi-image me-1"></i> Product
                  </Button>
                  <Button
                    variant={
                      viewMode === "variant" ? "primary" : "outline-primary"
                    }
                    onClick={() => setViewMode("variant")}
                    disabled={variants.length === 0}
                  >
                    <i className="bi bi-layers me-1"></i> Variant
                  </Button>
                </ButtonGroup>

                <Button
                  variant={dragEnabled ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => setDragEnabled(!dragEnabled)}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-arrows-move me-1"></i>
                  {dragEnabled ? "Reordering" : "Reorder"}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={
                    uploading || (viewMode === "variant" && !selectedVariant)
                  }
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-cloud-upload me-1"></i> Upload
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {viewMode === "variant" && variants.length > 0 && (
              <div className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Select Variant for Images
                </Form.Label>
                <Form.Select
                  value={selectedVariant || ""}
                  onChange={(e) => setSelectedVariant(e.target.value || null)}
                  className="py-2"
                >
                  <option value="" disabled>
                    Choose a variant
                  </option>
                  {variants.map((variant) => (
                    <option key={variant._id} value={variant._id}>
                      {variant.name} -{" "}
                      {Object.entries(variant.attributes || {})
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  Each variant can have its own specific images in addition to
                  the shared product images.
                </Form.Text>
              </div>
            )}

            {variants.length > 0 && (
              <Alert
                variant="info"
                className="d-flex align-items-start mb-4 border-left-info"
              >
                <i className="bi bi-info-circle-fill fs-5 me-3 text-info"></i>
                <div>
                  <strong>About Product and Variant Images</strong>
                  <ul className="mb-0 mt-2 ps-3">
                    <li className="mb-1">
                      <strong>Product Images:</strong> Visible for all variants
                      and on the main product page.
                    </li>
                    <li className="mb-1">
                      <strong>Variant Images:</strong> Only displayed when a
                      customer selects a specific variant.
                    </li>
                    <li className="mb-1">
                      Each variant can have unique images to highlight its
                      specific features.
                    </li>
                    <li>
                      At least one main image is required for the product.
                    </li>
                  </ul>
                </div>
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            )}

            {uploading && (
              <div className="text-center my-4 p-4 border rounded bg-light">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 mb-0 text-primary">Uploading images...</p>
              </div>
            )}

            {filteredImages.length === 0 ? (
              <Card className="bg-light text-center p-5 border-dashed">
                <div className="py-5">
                  <div className="mb-4">
                    <i
                      className="bi bi-image text-secondary"
                      style={{ fontSize: "64px" }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-3">No Images Available</h5>

                  {viewMode === "product" && (
                    <p className="text-muted mb-4">
                      This product doesn't have any general product images yet.
                    </p>
                  )}

                  {viewMode === "variant" && selectedVariant && (
                    <p className="text-muted mb-4">
                      This variant doesn't have any specific images yet. You can
                      add variant-specific images or use the general product
                      images.
                    </p>
                  )}

                  {(viewMode === "all" ||
                    (!selectedVariant && viewMode === "variant")) && (
                    <p className="text-muted mb-4">
                      {viewMode === "all"
                        ? "This product doesn't have any images yet."
                        : "Please select a variant to manage its images."}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleUploadClick}
                    disabled={viewMode === "variant" && !selectedVariant}
                    size="lg"
                    className="px-4"
                  >
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload{" "}
                    {viewMode === "variant" && selectedVariant
                      ? "Variant"
                      : "Product"}{" "}
                    Images
                  </Button>
                </div>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd} enabled={dragEnabled}>
                <Droppable droppableId="images" direction="horizontal">
                  {(provided) => (
                    <Row
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="g-4"
                    >
                      {filteredImages.map((image, index) => (
                        <Draggable
                          key={image._id}
                          draggableId={image._id}
                          index={index}
                          isDragDisabled={!dragEnabled}
                        >
                          {(provided) => (
                            <Col
                              sm={6}
                              md={4}
                              lg={3}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
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
                                    {dragEnabled && (
                                      <div className="drag-overlay">
                                        <i
                                          className="bi bi-arrows-move"
                                          style={{ fontSize: "24px" }}
                                        ></i>
                                      </div>
                                    )}
                                  </div>

                                  {image.isMain && (
                                    <Badge
                                      bg="primary"
                                      className="position-absolute top-0 start-0 m-2 px-2 py-1"
                                    >
                                      <i className="bi bi-star-fill me-1"></i>
                                      Main{" "}
                                      {image.variantId ? "Variant" : "Product"}
                                    </Badge>
                                  )}

                                  {image.variantId && (
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip>
                                          {variants.find(
                                            (v) => v._id === image.variantId
                                          )?.name || "Variant Image"}
                                        </Tooltip>
                                      }
                                    >
                                      <Badge
                                        bg="info"
                                        className="position-absolute top-0 end-0 m-2 px-2 py-1"
                                      >
                                        <i className="bi bi-layers-fill me-1"></i>
                                        Variant
                                      </Badge>
                                    </OverlayTrigger>
                                  )}

                                  {!image.variantId && (
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip>
                                          Shared image visible for all variants
                                        </Tooltip>
                                      }
                                    >
                                      <Badge
                                        bg="secondary"
                                        className="position-absolute top-0 end-0 m-2 px-2 py-1"
                                      >
                                        <i className="bi bi-image me-1"></i>
                                        Product
                                      </Badge>
                                    </OverlayTrigger>
                                  )}
                                </div>

                                <Card.Body className="p-3">
                                  <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Image description"
                                    value={image.alt || ""}
                                    onChange={(e) =>
                                      handleUpdateImageAlt(
                                        image._id,
                                        e.target.value
                                      )
                                    }
                                    className="mb-3"
                                  />

                                  <div className="d-flex gap-2 justify-content-between">
                                    {!image.isMain && (
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() =>
                                          handleSetMainImage(image._id)
                                        }
                                      >
                                        <i className="bi bi-star me-1"></i>
                                        Set as Main
                                      </Button>
                                    )}
                                    <div className="ms-auto">
                                      {!image.variantId &&
                                        variants.length > 0 && (
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={
                                              <Tooltip>
                                                Link this image to a specific
                                                variant
                                              </Tooltip>
                                            }
                                          >
                                            <Button
                                              variant="outline-info"
                                              size="sm"
                                              className="me-1"
                                              onClick={() => {
                                                toast.info(
                                                  "Variant linking feature will be implemented in a future update"
                                                );
                                              }}
                                            >
                                              <i className="bi bi-link"></i>
                                            </Button>
                                          </OverlayTrigger>
                                        )}
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteImage(image._id)
                                        }
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Row>
                  )}
                </Droppable>
              </DragDropContext>
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
          <div className="d-flex gap-2 w-100 justify-content-between">
            <div>
              {previewImage?.isMain ? (
                <Badge bg="primary" className="px-3 py-2">
                  <i className="bi bi-star-fill me-1"></i>
                  Main Image
                </Badge>
              ) : (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    if (previewImage) {
                      handleSetMainImage(previewImage._id);
                    }
                  }}
                >
                  <i className="bi bi-star me-1"></i>
                  Set as Main
                </Button>
              )}
            </div>
            <div>
              <Button variant="secondary" onClick={closeImagePreview}>
                Close
              </Button>
            </div>
          </div>
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
        .border-left-info {
          border-left: 4px solid #0dcaf0 !important;
        }
        .image-container {
          position: relative;
        }
        .drag-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ImagesManager;
