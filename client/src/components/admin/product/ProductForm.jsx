import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Card, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import adminService from "../../../services/admin.service";
import { toast } from "react-toastify";

const ProductForm = ({ product, isEditing = false }) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    brand: "",
    basePrice: "",
    salePrice: "",
    categories: [],
    sku: "",
    status: "active",
    inventory: "",
    isNewProduct: true,
    isBestSeller: false,
    isFeatured: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // Load product data if editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        brand: product.brand || "",
        basePrice: product.basePrice || "",
        salePrice: product.salePrice || "",
        categories: product.categories?.map((cat) => cat._id) || [],
        sku: product.sku || "",
        status: product.status || "active",
        inventory: product.inventory || "",
        isNewProduct: product.isNewProduct || false,
        isBestSeller: product.isBestSeller || false,
        isFeatured: product.isFeatured || false,
      });

      // Set existing images for preview
      if (product.images) {
        setPreviewImages(
          product.images.map((img) => ({
            id: img._id,
            url: img.imageUrl,
            isMain: img.isMain || false,
            isExisting: true,
          }))
        );
      }
    }
  }, [isEditing, product]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminService.getCategories();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear errors for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setFormData({ ...formData, categories: selectedValues });

    // Clear category error
    if (errors.categories) {
      setErrors({ ...errors, categories: null });
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs for selected files
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isMain: false,
      isExisting: false,
    }));

    setImageFiles([...imageFiles, ...files]);
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  // Set an image as main image
  const setAsMainImage = (index) => {
    const updatedPreviews = previewImages.map((preview, i) => ({
      ...preview,
      isMain: i === index,
    }));

    setPreviewImages(updatedPreviews);
  };

  // Remove an image
  const removeImage = async (index) => {
    const imageToRemove = previewImages[index];

    // If it's an existing image, delete from server
    if (imageToRemove.isExisting && product && product._id) {
      try {
        await adminService.deleteProductImage(product._id, imageToRemove.id);
        toast.success("Image removed successfully");
      } catch (err) {
        console.error("Error deleting image:", err);
        toast.error("Failed to delete image");
        return; // Don't remove from UI if delete failed
      }
    }

    // Remove from state
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(updatedPreviews);

    // If removed image was a file (not existing), remove from files array too
    if (!imageToRemove.isExisting) {
      const updatedFiles = imageFiles.filter((_, i) => {
        // This matching logic is a bit simplistic but works for this case
        return (
          previewImages.findIndex((p) => p.url === URL.createObjectURL(_)) !==
          index
        );
      });
      setImageFiles(updatedFiles);
    }

    // If the main image was removed, set the first remaining image as main
    if (imageToRemove.isMain && updatedPreviews.length > 0) {
      const newMainIndex = 0;
      updatedPreviews[newMainIndex].isMain = true;
      setPreviewImages([...updatedPreviews]);
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.description.trim().length < 100)
      newErrors.description = "Description must be at least 100 characters";
    if (!formData.shortDescription.trim())
      newErrors.shortDescription = "Short description is required";
    if (formData.shortDescription.trim().length > 200)
      newErrors.shortDescription =
        "Short description cannot exceed 200 characters";
    if (!formData.basePrice) newErrors.basePrice = "Base price is required";
    if (parseFloat(formData.basePrice) < 0)
      newErrors.basePrice = "Price cannot be negative";
    if (
      formData.salePrice &&
      parseFloat(formData.salePrice) > parseFloat(formData.basePrice)
    )
      newErrors.salePrice = "Sale price cannot be higher than base price";
    if (!formData.categories.length)
      newErrors.categories = "At least one category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    // Prepare form data for API
    const productData = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      salePrice: formData.salePrice
        ? parseFloat(formData.salePrice)
        : undefined,
      inventory: formData.inventory ? parseInt(formData.inventory) : undefined,
    };

    try {
      setLoading(true);

      let response;
      let productId;

      // Create or update product
      if (isEditing) {
        response = await adminService.updateProduct(product._id, productData);
        productId = product._id;
      } else {
        response = await adminService.createProduct(productData);
        productId = response.data._id;
      }

      if (!response.success) {
        throw new Error(response.message || "Failed to save product");
      }

      // Upload images if any
      if (imageFiles.length > 0) {
        setUploading(true);

        // Find which image should be main
        const mainIndex = previewImages.findIndex(
          (img) => img.isMain && !img.isExisting
        );

        // Upload each image
        for (let i = 0; i < imageFiles.length; i++) {
          const imageData = {
            file: imageFiles[i],
            isMain: i === mainIndex,
          };

          await adminService.uploadProductImage(productId, imageData);
        }
      }

      toast.success(
        `Product ${isEditing ? "updated" : "created"} successfully`
      );
      navigate("/admin/products");
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(err.message || "Failed to save product");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={8}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Product Information</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  Product Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Brand <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      isInvalid={!!errors.brand}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.brand}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SKU (Stock Keeping Unit)</Form.Label>
                    <Form.Control
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to generate automatically
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  Short Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  isInvalid={!!errors.shortDescription}
                  placeholder="Brief description for product listings (max 200 characters)"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.shortDescription}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.shortDescription.length}/200 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Full Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  isInvalid={!!errors.description}
                  placeholder="Detailed product description (min 100 characters)"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.description.length} characters (minimum 100)
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Product Images</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Form.Label>Upload Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Form.Text className="text-muted">
                  Select multiple images. First image will be the main product
                  image.
                </Form.Text>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4">
                  <label className="form-label">Product Images</label>
                  <Row className="g-3">
                    {previewImages.map((preview, index) => (
                      <Col xs={6} md={4} lg={3} key={index}>
                        <div className="position-relative border rounded">
                          <img
                            src={preview.url}
                            alt={`Preview ${index}`}
                            className="img-fluid rounded"
                            style={{ aspectRatio: "1/1", objectFit: "cover" }}
                          />
                          <div className="position-absolute top-0 end-0 p-2">
                            <Button
                              variant="danger"
                              size="sm"
                              className="rounded-circle"
                              onClick={() => removeImage(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                          <div className="position-absolute bottom-0 start-0 p-2">
                            <Form.Check
                              type="radio"
                              id={`main-image-${index}`}
                              label="Main"
                              checked={preview.isMain}
                              onChange={() => setAsMainImage(index)}
                              className="bg-white px-2 py-1 rounded-pill"
                            />
                          </div>
                          {preview.isMain && (
                            <Badge
                              bg="primary"
                              className="position-absolute top-0 start-0 m-2"
                            >
                              Main Image
                            </Badge>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Pricing & Inventory</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Base Price <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">₫</span>
                      <Form.Control
                        type="number"
                        min="0"
                        step="1000"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        isInvalid={!!errors.basePrice}
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.basePrice}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sale Price</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">₫</span>
                      <Form.Control
                        type="number"
                        min="0"
                        step="1000"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        isInvalid={!!errors.salePrice}
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.salePrice}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Inventory</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  placeholder="Leave empty if using variants"
                />
                <Form.Text className="text-muted">
                  Set inventory quantity, or leave empty if using variants
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Categories & Status</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  Categories <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  multiple
                  name="categories"
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  isInvalid={!!errors.categories}
                  style={{ height: "150px" }}
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.categories}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Hold Ctrl (or Command) to select multiple categories
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Mark as New Product"
                  name="isNewProduct"
                  checked={formData.isNewProduct}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Mark as Best Seller"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Feature on Homepage"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading || uploading}
            >
              {loading || uploading ? (
                <span>
                  <Spinner
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                    className="me-2"
                  />
                  {uploading ? "Uploading Images..." : "Saving..."}
                </span>
              ) : (
                <span>{isEditing ? "Update Product" : "Create Product"}</span>
              )}
            </Button>
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => navigate("/admin/products")}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default ProductForm;
