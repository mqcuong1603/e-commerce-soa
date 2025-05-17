import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  Badge,
  Tooltip,
  OverlayTrigger,
  Alert,
} from "react-bootstrap";
import adminService from "../../../services/admin.service";
import { toast } from "react-toastify";

const VariantsManager = ({ productId, variants, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    name: "",
    sku: "",
    price: "",
    salePrice: "",
    inventory: "",
    isActive: true,
    attributes: {},
  });
  const [attributeTemplates, setAttributeTemplates] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [attributeSuggestions, setAttributeSuggestions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unique attribute keys across all variants
  const attributeKeys = [
    ...new Set(variants.flatMap((v) => Object.keys(v.attributes || {}))),
  ];

  // On initial load, build attribute templates from existing variants
  useEffect(() => {
    if (variants.length > 0) {
      const templates = {};
      const suggestions = {};

      // Extract unique values for each attribute
      attributeKeys.forEach((key) => {
        const uniqueValues = [
          ...new Set(variants.map((v) => v.attributes?.[key]).filter(Boolean)),
        ];

        if (uniqueValues.length > 0) {
          templates[key] = uniqueValues;

          // Prepare suggested attribute values based on existing ones
          suggestions[key] = uniqueValues;
        }
      });

      setAttributeTemplates(templates);
      setAttributeSuggestions(suggestions);
    }
  }, [variants, attributeKeys]);

  const handleOpenModal = (variant = null) => {
    setFormErrors({});

    if (variant) {
      setEditingVariant(variant);
      setVariantForm({
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        salePrice: variant.salePrice || "",
        inventory: variant.inventory,
        isActive: variant.isActive,
        attributes: { ...variant.attributes },
      });
    } else {
      // Generate a clean, structured SKU
      const baseSkuPrefix = productId.slice(-4).toUpperCase();
      const variantNumber = variants.length + 1;
      const generatedSku = `PROD-${baseSkuPrefix}-V${variantNumber
        .toString()
        .padStart(2, "0")}`;

      setEditingVariant(null);
      setVariantForm({
        name: "",
        sku: generatedSku,
        price: "",
        salePrice: "",
        inventory: "0",
        isActive: true,
        attributes: attributeKeys.reduce(
          (acc, key) => ({ ...acc, [key]: "" }),
          {}
        ),
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setShowModal(false);
    setEditingVariant(null);
    setFormErrors({});
  };

  const handleVariantInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setVariantForm({
      ...variantForm,
      [name]: newValue,
    });

    // Clear the specific error when the field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleAttributeChange = (key, value) => {
    setVariantForm({
      ...variantForm,
      attributes: {
        ...variantForm.attributes,
        [key]: value,
      },
    });

    // Clear attribute-specific error if it exists
    if (formErrors[`attribute_${key}`]) {
      setFormErrors({
        ...formErrors,
        [`attribute_${key}`]: null,
      });
    }
  };

  const handleAddAttribute = () => {
    const newKey = prompt("Enter new attribute name:");
    if (newKey && newKey.trim()) {
      const normalizedKey = newKey.trim();

      if (variantForm.attributes[normalizedKey]) {
        toast.warning(`Attribute "${normalizedKey}" already exists`);
        return;
      }

      setVariantForm({
        ...variantForm,
        attributes: {
          ...variantForm.attributes,
          [normalizedKey]: "",
        },
      });
    }
  };

  const handleDeleteAttribute = (key) => {
    const updatedAttributes = { ...variantForm.attributes };
    delete updatedAttributes[key];

    setVariantForm({
      ...variantForm,
      attributes: updatedAttributes,
    });

    // Clear any error for this attribute
    if (formErrors[`attribute_${key}`]) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[`attribute_${key}`];
      setFormErrors(updatedErrors);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields
    if (!variantForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!variantForm.sku.trim()) {
      errors.sku = "SKU is required";
    } else if (
      variants.some(
        (v) =>
          v.sku === variantForm.sku &&
          (!editingVariant || v._id !== editingVariant._id)
      )
    ) {
      errors.sku = "This SKU is already in use";
    }

    if (!variantForm.price) {
      errors.price = "Price is required";
    } else if (parseFloat(variantForm.price) <= 0) {
      errors.price = "Price must be greater than zero";
    }

    if (variantForm.salePrice && parseFloat(variantForm.salePrice) <= 0) {
      errors.salePrice = "Sale price must be greater than zero";
    } else if (
      variantForm.salePrice &&
      parseFloat(variantForm.salePrice) >= parseFloat(variantForm.price)
    ) {
      errors.salePrice = "Sale price must be less than regular price";
    }

    if (parseInt(variantForm.inventory) < 0) {
      errors.inventory = "Inventory cannot be negative";
    }

    // Validate that each attribute has a value
    Object.entries(variantForm.attributes).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[`attribute_${key}`] = `Value for ${key} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveVariant = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = {
        ...variantForm,
        price: parseFloat(variantForm.price),
        salePrice: variantForm.salePrice
          ? parseFloat(variantForm.salePrice)
          : undefined,
        inventory: parseInt(variantForm.inventory),
      };

      let result;
      if (editingVariant) {
        // Update existing variant
        result = await adminService.updateProductVariant(
          productId,
          editingVariant._id,
          formData
        );
      } else {
        // Create new variant
        result = await adminService.createProductVariant(productId, formData);
      }

      if (result.success) {
        // Update local state
        if (editingVariant) {
          onChange(
            variants.map((v) =>
              v._id === editingVariant._id ? result.data : v
            )
          );
        } else {
          onChange([...variants, result.data]);
        }
        toast.success(
          `Variant ${editingVariant ? "updated" : "added"} successfully`
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Failed to save variant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variant) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the variant "${variant.name}"?`
      )
    ) {
      return;
    }

    try {
      const result = await adminService.deleteProductVariant(
        productId,
        variant._id
      );
      if (result.success) {
        onChange(variants.filter((v) => v._id !== variant._id));
        toast.success("Variant deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    }
  };

  const getDiscountPercentage = (price, salePrice) => {
    if (!salePrice || salePrice >= price) return null;
    return Math.round(((price - salePrice) / price) * 100);
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-4">
        <h5 className="mb-0">Product Variants</h5>
        <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg me-1"></i> Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <Card className="bg-light text-center p-5">
          <div className="py-5">
            <div className="mb-3">
              <i
                className="bi bi-boxes text-secondary"
                style={{ fontSize: "48px" }}
              ></i>
            </div>
            <h5 className="fw-bold mb-2">No Variants</h5>
            <p className="text-muted mb-4">
              This product doesn't have any variants yet. Each product requires
              at least one variant to manage inventory and pricing.
            </p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              Add First Variant
            </Button>
          </div>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Attributes</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant._id}>
                  <td>
                    <div className="fw-medium">{variant.name}</div>
                  </td>
                  <td>
                    <span className="text-muted small">{variant.sku}</span>
                  </td>
                  <td>
                    {variant.attributes &&
                      Object.entries(variant.attributes).map(([key, value]) => (
                        <Badge
                          bg="light"
                          text="dark"
                          className="me-1 mb-1 py-2 px-2"
                          key={key}
                        >
                          <span className="text-muted small me-1">{key}:</span>{" "}
                          {value}
                        </Badge>
                      ))}
                  </td>
                  <td>
                    {variant.salePrice ? (
                      <div>
                        <div className="fw-bold text-success">
                          ₫{variant.salePrice?.toLocaleString()}
                        </div>
                        <div className="small">
                          <s className="text-muted me-1">
                            ₫{variant.price?.toLocaleString()}
                          </s>
                          <span className="text-danger">
                            -
                            {getDiscountPercentage(
                              variant.price,
                              variant.salePrice
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="fw-medium">
                        ₫{variant.price?.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {variant.inventory > 0 ? "In stock" : "Out of stock"}
                        </Tooltip>
                      }
                    >
                      <span
                        className={`badge ${
                          variant.inventory > 0
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                        } px-2 py-1`}
                      >
                        {variant.inventory}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <Badge
                      bg={
                        variant.isActive ? "success-subtle" : "secondary-subtle"
                      }
                      text={variant.isActive ? "success" : "secondary"}
                      className="px-2 py-1"
                    >
                      {variant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenModal(variant)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Variant Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        backdrop="static"
        className="variant-edit-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingVariant ? "Edit Variant" : "Add New Variant"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Variant Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={variantForm.name}
                    onChange={handleVariantInputChange}
                    placeholder="e.g., 2TB, 4TB, 8TB"
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    A descriptive name for this variant (e.g., capacity, color)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SKU*</Form.Label>
                  <Form.Control
                    type="text"
                    name="sku"
                    value={variantForm.sku}
                    onChange={handleVariantInputChange}
                    isInvalid={!!formErrors.sku}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.sku}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Stock Keeping Unit - a unique identifier for this variant
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price*</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>₫</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="price"
                      value={variantForm.price}
                      onChange={handleVariantInputChange}
                      min="0"
                      isInvalid={!!formErrors.price}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.price}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sale Price</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>₫</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="salePrice"
                      value={variantForm.salePrice}
                      onChange={handleVariantInputChange}
                      min="0"
                      isInvalid={!!formErrors.salePrice}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.salePrice}
                    </Form.Control.Feedback>
                  </InputGroup>
                  {variantForm.price &&
                    variantForm.salePrice &&
                    parseFloat(variantForm.salePrice) > 0 &&
                    parseFloat(variantForm.salePrice) <
                      parseFloat(variantForm.price) && (
                      <Form.Text className="text-success">
                        {getDiscountPercentage(
                          parseFloat(variantForm.price),
                          parseFloat(variantForm.salePrice)
                        )}
                        % discount
                      </Form.Text>
                    )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Inventory*</Form.Label>
                  <Form.Control
                    type="number"
                    name="inventory"
                    value={variantForm.inventory}
                    onChange={handleVariantInputChange}
                    min="0"
                    isInvalid={!!formErrors.inventory}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.inventory}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                name="isActive"
                id="variant-active-switch"
                checked={variantForm.isActive}
                onChange={handleVariantInputChange}
                label="Variant is active"
              />
            </Form.Group>

            <Card className="mt-4 mb-3 border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h6 className="mb-0 fw-bold">Variant Attributes</h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAddAttribute}
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Attribute
                </Button>
              </Card.Header>
              <Card.Body>
                {Object.keys(variantForm.attributes || {}).length === 0 ? (
                  <p className="text-center text-muted my-3">
                    No attributes defined
                  </p>
                ) : (
                  <Row>
                    {Object.entries(variantForm.attributes).map(
                      ([key, value]) => (
                        <Col md={6} key={key} className="mb-3">
                          <Form.Group>
                            <Form.Label className="small fw-medium">
                              {key}*
                            </Form.Label>
                            <InputGroup hasValidation>
                              {attributeTemplates[key] &&
                              attributeTemplates[key].length > 0 ? (
                                <Form.Select
                                  value={value}
                                  onChange={(e) =>
                                    handleAttributeChange(key, e.target.value)
                                  }
                                  isInvalid={!!formErrors[`attribute_${key}`]}
                                >
                                  <option value="">Select {key}</option>
                                  {attributeTemplates[key].map((val, idx) => (
                                    <option key={idx} value={val}>
                                      {val}
                                    </option>
                                  ))}
                                </Form.Select>
                              ) : (
                                <Form.Control
                                  value={value}
                                  onChange={(e) =>
                                    handleAttributeChange(key, e.target.value)
                                  }
                                  placeholder={`Value for ${key}`}
                                  isInvalid={!!formErrors[`attribute_${key}`]}
                                />
                              )}
                              <Button
                                variant="outline-danger"
                                onClick={() => handleDeleteAttribute(key)}
                              >
                                <i className="bi bi-x"></i>
                              </Button>
                              <Form.Control.Feedback type="invalid">
                                {formErrors[`attribute_${key}`]}
                              </Form.Control.Feedback>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      )
                    )}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveVariant}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : editingVariant ? (
              "Update Variant"
            ) : (
              "Add Variant"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VariantsManager;
