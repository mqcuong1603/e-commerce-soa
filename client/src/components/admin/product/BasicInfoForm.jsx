import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import adminService from "../../../services/admin.service";

const BasicInfoForm = ({ data, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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
    onChange({
      ...data,
      [name]: type === "checkbox" ? checked : value,
    });
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
  };

  return (
    <div>
      <Form.Group className="mb-4">
        <Form.Label>Product Name*</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={data.name || ""}
          onChange={handleChange}
          required
          placeholder="Enter product name"
        />
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
            />
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
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Hold Ctrl (or Cmd) to select multiple categories
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>Short Description</Form.Label>
        <Form.Control
          as="textarea"
          name="shortDescription"
          value={data.shortDescription || ""}
          onChange={handleChange}
          placeholder="Brief product description (100-150 characters)"
          style={{ height: "80px" }}
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Full Description*</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={data.description || ""}
          onChange={handleChange}
          required
          placeholder="Detailed product description"
          style={{ height: "200px" }}
        />
      </Form.Group>

      <div className="mb-4">
        <label className="form-label fw-bold mb-3">
          Product Status & Visibility
        </label>
        <div className="d-flex flex-wrap gap-4">
          <Form.Check
            type="switch"
            id="isActive"
            name="isActive"
            label="Active Product"
            checked={data.isActive || false}
            onChange={handleChange}
          />
          <Form.Check
            type="switch"
            id="isFeatured"
            name="isFeatured"
            label="Featured Product"
            checked={data.isFeatured || false}
            onChange={handleChange}
          />
          <Form.Check
            type="switch"
            id="isNewProduct"
            name="isNewProduct"
            label="New Product"
            checked={data.isNewProduct || false}
            onChange={handleChange}
          />
          <Form.Check
            type="switch"
            id="isBestSeller"
            name="isBestSeller"
            label="Best Seller"
            checked={data.isBestSeller || false}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
