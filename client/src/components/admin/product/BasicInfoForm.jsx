import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  Badge,
  Spinner,
  Button,
  Alert,
} from "react-bootstrap";
import adminService from "../../../services/admin.service";

const BasicInfoForm = ({ data, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState(data.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Initialize tags from the data when it changes
  useEffect(() => {
    if (data.tags && Array.isArray(data.tags)) {
      setTags(data.tags);
    }
  }, [data.tags]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await adminService.getCategories();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    onChange({
      ...data,
      [name]: newValue,
    });

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedCategories = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }

    onChange({
      ...data,
      categories: selectedCategories,
    });

    // Clear error when categories are updated
    if (formErrors.categories) {
      setFormErrors({
        ...formErrors,
        categories: null,
      });
    }
  };

  // Tag management
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag) => {
    if (!tag) return;

    const normalizedTag = tag.toLowerCase().trim();

    if (normalizedTag && !tags.includes(normalizedTag)) {
      const newTags = [...tags, normalizedTag];
      setTags(newTags);
      onChange({
        ...data,
        tags: newTags,
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onChange({
      ...data,
      tags: newTags,
    });
  };

  // Character limits
  const shortDescMaxLength = 200;
  const shortDescLength = (data.shortDescription || "").length;
  const shortDescRemaining = shortDescMaxLength - shortDescLength;

  const descMinLength = 100;
  const descLength = (data.description || "").length;

  // Calculate required field errors
  const validateField = (fieldName) => {
    let errorMessage = null;

    switch (fieldName) {
      case "name":
        if (!data.name?.trim()) {
          errorMessage = "Product name is required";
        }
        break;
      case "brand":
        if (!data.brand?.trim()) {
          errorMessage = "Brand is required";
        }
        break;
      case "categories":
        if (!data.categories?.length) {
          errorMessage = "At least one category is required";
        }
        break;
      case "shortDescription":
        if (!data.shortDescription?.trim()) {
          errorMessage = "Short description is required";
        } else if (data.shortDescription.length > shortDescMaxLength) {
          errorMessage = `Short description cannot exceed ${shortDescMaxLength} characters`;
        }
        break;
      case "description":
        if (!data.description?.trim()) {
          errorMessage = "Description is required";
        } else if (data.description.length < descMinLength) {
          errorMessage = `Description must be at least ${descMinLength} characters`;
        }
        break;
      default:
        break;
    }

    return errorMessage;
  };

  // Validate all fields and update errors
  const validateForm = () => {
    const fieldNames = [
      "name",
      "brand",
      "categories",
      "shortDescription",
      "description",
    ];
    const errors = {};

    fieldNames.forEach((field) => {
      const error = validateField(field);
      if (error) {
        errors[field] = error;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Effect to validate form when user submits parent form
  useEffect(() => {
    const validateAndUpdate = () => {
      // Only validate if we have essential data
      if (data.name || data.description) {
        validateForm();
      }
    };

    validateAndUpdate();
  }, [
    data.name,
    data.brand,
    data.categories,
    data.shortDescription,
    data.description,
  ]);

  return (
    <div>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">General Information</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-4">
            <Form.Label>Product Name*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={data.name || ""}
              onChange={handleChange}
              required
              placeholder="Enter product name"
              className="form-control-lg"
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Brand*</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={data.brand || ""}
                  onChange={handleChange}
                  required
                  placeholder="Enter brand name"
                  isInvalid={!!formErrors.brand}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.brand}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Categories*</Form.Label>
                <Form.Select
                  multiple
                  name="categories"
                  value={data.categories || []}
                  onChange={handleCategoryChange}
                  disabled={loading}
                  style={{ height: "120px" }}
                  isInvalid={!!formErrors.categories}
                >
                  {loading ? (
                    <option disabled>Loading categories...</option>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.categories}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Hold Ctrl (or Cmd) to select multiple categories
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Tags</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tag and press Enter"
              />
              <Button
                variant="outline-secondary"
                onClick={() => addTag(tagInput.trim())}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </InputGroup>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge bg="light" text="dark" className="py-2 px-3" key={index}>
                  {tag}
                  <button
                    type="button"
                    className="btn-close ms-2"
                    style={{ fontSize: "0.5rem" }}
                    onClick={() => removeTag(tag)}
                    aria-label="Remove tag"
                  ></button>
                </Badge>
              ))}
            </div>
            <Form.Text className="text-muted">
              Tags help customers find your product (e.g., storage, hdd, ssd)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Short Description*</Form.Label>
            <Form.Control
              as="textarea"
              name="shortDescription"
              value={data.shortDescription || ""}
              onChange={handleChange}
              placeholder="Brief product description (maximum 200 characters)"
              style={{ height: "80px" }}
              maxLength={shortDescMaxLength}
              isInvalid={!!formErrors.shortDescription}
            />
            <div className="d-flex justify-content-between mt-1">
              <Form.Control.Feedback type="invalid">
                {formErrors.shortDescription}
              </Form.Control.Feedback>
              <span
                className={`small ${
                  shortDescRemaining < 20 ? "text-danger" : "text-muted"
                }`}
              >
                {shortDescLength}/{shortDescMaxLength} characters
              </span>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Full Description*</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={data.description || ""}
              onChange={handleChange}
              required
              placeholder="Detailed product description (minimum 100 characters)"
              style={{ height: "200px" }}
              minLength={descMinLength}
              isInvalid={!!formErrors.description}
            />
            <div className="d-flex justify-content-between mt-1">
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
              <span
                className={`small ${
                  descLength < descMinLength ? "text-danger" : "text-success"
                }`}
              >
                {descLength} characters{" "}
                {descLength < descMinLength
                  ? `(${descMinLength - descLength} more needed)`
                  : ""}
              </span>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Product Status & Visibility</h5>
        </Card.Header>
        <Card.Body>
          <Row className="gy-3">
            <Col md={6}>
              <Form.Check
                type="switch"
                id="isActive"
                name="isActive"
                label="Active Product"
                checked={data.isActive || false}
                onChange={handleChange}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block ms-4">
                When active, the product will be visible to customers
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="isFeatured"
                name="isFeatured"
                label="Featured Product"
                checked={data.isFeatured || false}
                onChange={handleChange}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block ms-4">
                Highlight this product in featured sections of your store
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="isNewProduct"
                name="isNewProduct"
                label="New Product"
                checked={data.isNewProduct || false}
                onChange={handleChange}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block ms-4">
                Mark as a new arrival in your store
              </Form.Text>
            </Col>
            <Col md={6}>
              <Form.Check
                type="switch"
                id="isBestSeller"
                name="isBestSeller"
                label="Best Seller"
                checked={data.isBestSeller || false}
                onChange={handleChange}
                className="mb-2"
              />
              <Form.Text className="text-muted d-block ms-4">
                Mark as a best-selling product
              </Form.Text>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BasicInfoForm;
