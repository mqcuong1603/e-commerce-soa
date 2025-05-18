import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Badge,
  InputGroup,
  ListGroup,
  CloseButton,
} from "react-bootstrap";
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
    categories: [],
    tags: [], // Added tags
    isActive: true, // Changed from status
    isNewProduct: true,
    isBestSeller: false,
    isFeatured: false,
  });

  const [productVariants, setProductVariants] = useState([
    // Example variant structure
    // { sku: '', name: '', price: '', salePrice: '', inventory: '', attributes: { color: '', size: '' } }
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentTag, setCurrentTag] = useState("");

  // Memoize setAsMainImage using useCallback and functional update
  const setAsMainImage = useCallback((indexToSetMain) => {
    setPreviewImages((currentPreviews) =>
      currentPreviews.map((preview, i) => ({
        ...preview,
        isMain: i === indexToSetMain,
      }))
    );
  }, []); // setPreviewImages is stable, so empty dependency array is fine

  // Effect to ensure a main image is always selected if images exist
  useEffect(() => {
    if (previewImages.length > 0 && !previewImages.some((p) => p.isMain)) {
      // Set the first image as main
      setPreviewImages((currentPreviews) => {
        // Guard against an unlikely race condition where currentPreviews might be empty
        if (currentPreviews.length === 0) return [];
        return currentPreviews.map((img, idx) => ({
          ...img,
          isMain: idx === 0,
        }));
      });
    }
  }, [previewImages]); // Re-run when previewImages array reference changes

  // Load product data if editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        brand: product.brand || "",
        basePrice: product.basePrice || "",
        categories: product.categories?.map((cat) => cat._id) || [],
        tags: product.tags || [],
        isActive: product.isActive !== undefined ? product.isActive : true,
        isNewProduct: product.isNewProduct || false,
        isBestSeller: product.isBestSeller || false,
        isFeatured: product.isFeatured || false,
      });

      if (product.variants && product.variants.length > 0) {
        setProductVariants(
          product.variants.map((v) => ({
            id: v._id, // Keep track of existing variant IDs
            sku: v.sku || "",
            name: v.name || "",
            price: v.price || "",
            salePrice: v.salePrice || "",
            inventory: v.inventory || 0,
            attributes: v.attributes || {},
          }))
        );
      } else {
        setProductVariants([]);
      }

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
          // Ensure response.data is an array, default to empty array if not
          setCategories(Array.isArray(response.data) ? response.data : []);
        } else {
          setCategories([]); // Set to empty array on failure
          toast.error(response.message || "Failed to load categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]); // Set to empty array on error
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

    if (previewImages.length + files.length > 3) {
      toast.warn("You can upload a maximum of 3 images per product.");
      e.target.value = null;
      return;
    }

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
    // setPreviewImages(updatedPreviews); // This will be handled by the useEffect or subsequent logic if needed

    // If removed image was a file (not existing), remove from files array too
    if (!imageToRemove.isExisting && imageToRemove.file) {
      setImageFiles((currentImageFiles) =>
        currentImageFiles.filter((f) => f !== imageToRemove.file)
      );
    }

    // If the main image was removed and there are still previews,
    // the useEffect will handle setting a new main image.
    // However, to make it more immediate and specific, we can still set one here.
    // The useEffect will act as a fallback.
    if (imageToRemove.isMain && updatedPreviews.length > 0) {
      // Check if any other image is already main in updatedPreviews
      if (!updatedPreviews.some((p) => p.isMain)) {
        updatedPreviews[0].isMain = true;
      }
    }
    setPreviewImages(updatedPreviews); // Now set the state
  };

  // Tag Management
  const handleTagInputChange = (e) => {
    setCurrentTag(e.target.value);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Variant Management
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...productVariants];
    if (field.startsWith("attributes.")) {
      const attrKey = field.split(".")[1];
      updatedVariants[index].attributes = {
        ...updatedVariants[index].attributes,
        [attrKey]: value,
      };
    } else {
      updatedVariants[index][field] = value;
    }
    setProductVariants(updatedVariants);
  };

  const addVariant = () => {
    setProductVariants([
      ...productVariants,
      {
        sku: "",
        name: "",
        price: "",
        salePrice: "",
        inventory: 0,
        attributes: {},
      },
    ]);
  };

  const removeVariant = (index) => {
    const updatedVariants = productVariants.filter((_, i) => i !== index);
    setProductVariants(updatedVariants);
  };

  // Validate form data
  const validateForm = useCallback(() => {
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
    if (!formData.basePrice || parseFloat(formData.basePrice) < 0)
      newErrors.basePrice = "Valid base price is required";
    if (!formData.categories.length)
      newErrors.categories = "At least one category is required";

    const variantErrors = [];
    productVariants.forEach((variant, index) => {
      const errors = {};
      if (!variant.sku.trim()) errors.sku = "SKU is required";
      if (!variant.name.trim()) errors.name = "Variant name is required";
      if (!variant.price || parseFloat(variant.price) < 0)
        errors.price = "Valid price is required";
      if (variant.salePrice && parseFloat(variant.salePrice) < 0)
        errors.salePrice = "Sale price cannot be negative";
      if (
        variant.salePrice &&
        parseFloat(variant.salePrice) > parseFloat(variant.price)
      )
        errors.salePrice = "Sale price cannot be higher than variant price";
      if (variant.inventory === undefined || parseInt(variant.inventory) < 0)
        errors.inventory = "Valid inventory is required (0 or more)";
      if (Object.keys(errors).length > 0) variantErrors[index] = errors;
    });

    if (variantErrors.length > 0) newErrors.variants = variantErrors;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, productVariants]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    // Prepare form data for API
    const productDataPayload = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      // isActive is already a boolean
      // tags are already an array of strings
      variants: productVariants.map((variant) => ({
        sku: variant.sku,
        name: variant.name,
        price: parseFloat(variant.price),
        salePrice: variant.salePrice
          ? parseFloat(variant.salePrice)
          : undefined,
        inventory: parseInt(variant.inventory),
        attributes: variant.attributes,
        // Include ID if it's an existing variant being updated
        ...(variant.id && { _id: variant.id }),
      })),
      // Images will be uploaded separately as per existing logic
      // If createProduct is to handle initial image list, this needs adjustment
      images: [], // Send empty or omit if images are handled by uploadProductImage
    };

    // Remove salePrice and inventory from top-level if they exist (legacy)
    delete productDataPayload.salePrice;
    delete productDataPayload.inventory;
    delete productDataPayload.sku;
    delete productDataPayload.status;

    try {
      setLoading(true);
      let response;
      let productId;

      if (isEditing) {
        // For updates, the backend's updateProduct would also need to handle variants and images similarly
        // This example focuses on createProduct; updateProduct would need a parallel refactor
        response = await adminService.updateProduct(
          product._id,
          productDataPayload
        );
        productId = product._id;
      } else {
        response = await adminService.createProduct(productDataPayload);
        productId = response.data._id;
      }

      if (!response.success) {
        throw new Error(
          response.message ||
            `Failed to ${isEditing ? "update" : "create"} product`
        );
      }

      // Image upload logic (remains largely the same, happens after product creation/update)
      if (imageFiles.length > 0) {
        setUploading(true);
        const mainImagePreview = previewImages.find(
          (img) => img.isMain && !img.isExisting
        );
        const mainImageFile = mainImagePreview ? mainImagePreview.file : null;

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const imageIsMain = file === mainImageFile;
          // Find corresponding preview to get alt text if available, or use product name
          const preview = previewImages.find((p) => p.file === file);
          const altText = preview?.alt || formData.name;

          const imageFormData = new FormData();
          imageFormData.append("image", file);
          imageFormData.append("isMain", String(imageIsMain)); // Convert boolean to string
          imageFormData.append("alt", altText);
          // If images can be associated with variants during upload:
          // imageFormData.append("variantId", "some_variant_id_if_applicable");

          await adminService.uploadProductImage(productId, imageFormData);
        }
      }

      toast.success(
        `Product ${isEditing ? "updated" : "created"} successfully`
      );
      navigate("/admin/products");
    } catch (err) {
      console.error(
        `Error saving product (${isEditing ? "update" : "create"}):`,
        err
      );
      toast.error(
        err.response?.data?.message ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} product`
      );
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
                {/* SKU field removed from here, will be part of variants */}
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
                  disabled={previewImages.length >= 3} // Disable if 3 images are already present
                />
                <Form.Text className="text-muted">
                  Select up to 3 images. First image selected will be the main
                  product image by default.
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

          {/* Product Variants Card - NEW */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Product Variants</h5>
              <Button variant="outline-primary" size="sm" onClick={addVariant}>
                <i className="bi bi-plus-circle me-1"></i> Add Variant
              </Button>
            </Card.Header>
            <Card.Body>
              {productVariants.map((variant, index) => (
                <div key={index} className="mb-4 p-3 border rounded">
                  <Row className="align-items-center mb-2">
                    <Col>
                      <h6>Variant {index + 1}</h6>
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <i className="bi bi-trash"></i> Remove
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Variant Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={variant.name}
                          onChange={(e) =>
                            handleVariantChange(index, "name", e.target.value)
                          }
                          isInvalid={!!errors.variants?.[index]?.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.variants?.[index]?.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          SKU <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(index, "sku", e.target.value)
                          }
                          isInvalid={!!errors.variants?.[index]?.sku}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.variants?.[index]?.sku}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Price <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>₫</InputGroup.Text>
                          <Form.Control
                            type="number"
                            min="0"
                            step="1000"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            isInvalid={!!errors.variants?.[index]?.price}
                          />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.variants?.[index]?.price}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sale Price</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>₫</InputGroup.Text>
                          <Form.Control
                            type="number"
                            min="0"
                            step="1000"
                            value={variant.salePrice}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "salePrice",
                                e.target.value
                              )
                            }
                            isInvalid={!!errors.variants?.[index]?.salePrice}
                          />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.variants?.[index]?.salePrice}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Inventory <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="1"
                          value={variant.inventory}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "inventory",
                              e.target.value
                            )
                          }
                          isInvalid={!!errors.variants?.[index]?.inventory}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.variants?.[index]?.inventory}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Attributes (e.g., Color, Size)</Form.Label>
                    {/* Basic attribute handling: example for 'color' and 'size' */}
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Attribute: Color (e.g., Red)"
                          value={variant.attributes?.color || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "attributes.color",
                              e.target.value
                            )
                          }
                          className="mb-2"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Attribute: Size (e.g., Large)"
                          value={variant.attributes?.size || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "attributes.size",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                    </Row>
                    <Form.Text muted>
                      Customize attributes as needed. For more complex
                      attributes, consider a dynamic key-value pair system.
                    </Form.Text>
                  </Form.Group>
                </div>
              ))}
              {productVariants.length === 0 && (
                <p className="text-muted">
                  No variants added. Click "Add Variant" to create product
                  options.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Pricing & Inventory Card - Base Price remains, inventory and sale price moved to variants */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Base Product Details</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>
                  Base Price (Default) <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text>₫</InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1000"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    isInvalid={!!errors.basePrice}
                    placeholder="Price if no variants"
                  />
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.basePrice}
                </Form.Control.Feedback>
                <Form.Text muted>
                  This price is used if no variants are specified or as a
                  general reference.
                </Form.Text>
              </Form.Group>
              {/* Sale Price and Inventory fields removed from here */}
            </Card.Body>
          </Card>

          {/* Categories & Status Card */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Organization & Visibility</h5>
            </Card.Header>
            <Card.Body>
              {/* Categories (existing) */}
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

              {/* Tags - NEW */}
              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <InputGroup className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Add a tag"
                    value={currentTag}
                    onChange={handleTagInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button variant="outline-secondary" onClick={addTag}>
                    Add
                  </Button>
                </InputGroup>
                <div>
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      pill
                      bg="light"
                      text="dark"
                      className="me-2 mb-2 p-2"
                    >
                      {tag}
                      <CloseButton
                        onClick={() => removeTag(tag)}
                        className="ms-1"
                        style={{ fontSize: "0.65em" }}
                      />
                    </Badge>
                  ))}
                </div>
                <Form.Text muted>
                  Keywords to help customers find the product.
                </Form.Text>
              </Form.Group>

              {/* Status (changed to isActive) */}
              <Form.Group className="mb-3">
                <Form.Label>Product Status</Form.Label>
                <Form.Select
                  name="isActive"
                  value={formData.isActive}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "isActive",
                        value: e.target.value === "true",
                        type: "select",
                      },
                    })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>

              {/* Checkboxes (existing) */}
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

          {/* Submit Buttons (existing) */}
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
