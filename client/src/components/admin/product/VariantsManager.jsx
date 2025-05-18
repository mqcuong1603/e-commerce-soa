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
  Dropdown,
  Spinner,
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
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  const openDeleteConfirmation = (variant) => {
    setConfirmDelete(variant);
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete(null);
  };

  const handleDeleteVariant = async () => {
    if (!confirmDelete) return;

    try {
      const result = await adminService.deleteProductVariant(
        productId,
        confirmDelete._id
      );
      if (result.success) {
        onChange(variants.filter((v) => v._id !== confirmDelete._id));
        toast.success("Variant deleted successfully");
        closeDeleteConfirmation();
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
      <Card className="shadow border-0 mb-4">
        <Card.Header className="bg-white border-bottom border-light py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">
              <i className="bi bi-boxes text-primary me-2"></i>
              Product Variants
            </h5>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center"
              onClick={() => handleOpenModal()}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Variant
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {variants.length === 0 ? (
            <Card className="bg-light text-center p-5 border-dashed">
              <div className="py-5">
                <div className="mb-4">
                  <i
                    className="bi bi-boxes text-secondary"
                    style={{ fontSize: "64px" }}
                  ></i>
                </div>
                <h5 className="fw-bold mb-3">No Variants</h5>
                <p className="text-muted mb-4">
                  This product doesn't have any variants yet. Each product
                  requires at least one variant to manage inventory and pricing.
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleOpenModal()}
                  size="lg"
                  className="px-4"
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add First Variant
                </Button>
              </div>
            </Card>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle table-borderless">
                <thead className="bg-light">
                  <tr>
                    <th className="fw-semibold py-3">Name</th>
                    <th className="fw-semibold py-3">SKU</th>
                    <th className="fw-semibold py-3">Attributes</th>
                    <th className="fw-semibold py-3">Price</th>
                    <th className="fw-semibold py-3">Inventory</th>
                    <th className="fw-semibold py-3">Status</th>
                    <th className="text-end fw-semibold py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant._id} className="border-bottom">
                      <td className="py-3">
                        <div className="fw-medium">{variant.name}</div>
                      </td>
                      <td className="py-3">
                        <span className="text-muted small">{variant.sku}</span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex flex-wrap gap-1">
                          {variant.attributes &&
                            Object.entries(variant.attributes).map(
                              ([key, value]) => (
                                <Badge
                                  bg="light"
                                  text="dark"
                                  className="me-1 mb-1 py-1 px-2 rounded-pill"
                                  key={key}
                                >
                                  <span className="text-muted small me-1">
                                    {key}:
                                  </span>{" "}
                                  <span className="fw-medium">{value}</span>
                                </Badge>
                              )
                            )}
                        </div>
                      </td>
                      <td className="py-3">
                        {variant.salePrice ? (
                          <div>
                            <div className="fw-bold text-success">
                              ₫{variant.salePrice?.toLocaleString()}
                            </div>
                            <div className="small d-flex align-items-center mt-1">
                              <s className="text-muted me-2">
                                ₫{variant.price?.toLocaleString()}
                              </s>
                              <Badge
                                bg="danger-subtle"
                                text="danger"
                                className="px-2 py-1 rounded-pill"
                              >
                                -
                                {getDiscountPercentage(
                                  variant.price,
                                  variant.salePrice
                                )}
                                %
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="fw-medium">
                            ₫{variant.price?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              {variant.inventory > 0
                                ? "In stock"
                                : "Out of stock"}
                            </Tooltip>
                          }
                        >
                          <Badge
                            bg={
                              variant.inventory > 0
                                ? "success-subtle"
                                : "danger-subtle"
                            }
                            text={variant.inventory > 0 ? "success" : "danger"}
                            className="px-3 py-2 rounded-pill"
                          >
                            <i
                              className={`bi bi-${
                                variant.inventory > 0
                                  ? "check-circle"
                                  : "x-circle"
                              } me-1`}
                            ></i>
                            {variant.inventory}
                          </Badge>
                        </OverlayTrigger>
                      </td>
                      <td className="py-3">
                        <Badge
                          bg={
                            variant.isActive
                              ? "success-subtle"
                              : "secondary-subtle"
                          }
                          text={variant.isActive ? "success" : "secondary"}
                          className="px-3 py-2 rounded-pill"
                        >
                          <i
                            className={`bi bi-${
                              variant.isActive ? "check-circle" : "dash-circle"
                            } me-1`}
                          ></i>
                          {variant.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenModal(variant)}
                            className="btn-icon"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteConfirmation(variant)}
                            className="btn-icon"
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
        </Card.Body>
      </Card>

      {/* Variant Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        backdrop="static"
        className="variant-edit-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <i
              className={`bi bi-${
                editingVariant ? "pencil" : "plus-lg"
              } text-primary me-2`}
            ></i>
            {editingVariant ? "Edit Variant" : "Add New Variant"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">
                    Variant Name*
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={variantForm.name}
                    onChange={handleVariantInputChange}
                    placeholder="e.g., 2TB, 4TB, 8TB"
                    isInvalid={!!formErrors.name}
                    className="py-2"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted mt-1">
                    <i className="bi bi-info-circle me-1"></i>A descriptive name
                    for this variant (e.g., capacity, color)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">
                    SKU*
                  </Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type="text"
                      name="sku"
                      value={variantForm.sku}
                      onChange={handleVariantInputChange}
                      isInvalid={!!formErrors.sku}
                      className="py-2"
                    />
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Generate new SKU</Tooltip>}
                    >
                      <Button
                        variant="outline-secondary"
                        onClick={() => {
                          const baseSkuPrefix = productId
                            .slice(-4)
                            .toUpperCase();
                          const variantNumber = variants.length + 1;
                          const generatedSku = `PROD-${baseSkuPrefix}-V${variantNumber
                            .toString()
                            .padStart(2, "0")}`;
                          setVariantForm({
                            ...variantForm,
                            sku: generatedSku,
                          });
                        }}
                      >
                        <i className="bi bi-arrow-repeat"></i>
                      </Button>
                    </OverlayTrigger>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.sku}
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted mt-1">
                    <i className="bi bi-tag me-1"></i>
                    Stock Keeping Unit - a unique identifier for this variant
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">
                    Price*
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light border-0">
                      ₫
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="price"
                      value={variantForm.price}
                      onChange={handleVariantInputChange}
                      min="0"
                      isInvalid={!!formErrors.price}
                      className="py-2"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.price}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">
                    Sale Price
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light border-0">
                      ₫
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="salePrice"
                      value={variantForm.salePrice}
                      onChange={handleVariantInputChange}
                      min="0"
                      isInvalid={!!formErrors.salePrice}
                      className="py-2"
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
                      <Badge
                        bg="danger-subtle"
                        text="danger"
                        className="mt-2 px-2 py-1"
                      >
                        <i className="bi bi-tag-fill me-1"></i>
                        {getDiscountPercentage(
                          parseFloat(variantForm.price),
                          parseFloat(variantForm.salePrice)
                        )}
                        % discount
                      </Badge>
                    )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">
                    Inventory*
                  </Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type="number"
                      name="inventory"
                      value={variantForm.inventory}
                      onChange={handleVariantInputChange}
                      min="0"
                      isInvalid={!!formErrors.inventory}
                      className="py-2"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.inventory}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <div className="p-3 border rounded-3 bg-light">
                <Form.Check
                  type="switch"
                  name="isActive"
                  id="variant-active-switch"
                  checked={variantForm.isActive}
                  onChange={handleVariantInputChange}
                  label={<span className="fw-medium">Variant is active</span>}
                  className="form-switch-lg"
                />
                <Form.Text className="text-muted d-block ms-4">
                  When enabled, this variant will be visible to customers for
                  purchase
                </Form.Text>
              </div>
            </Form.Group>

            <Card className="mt-4 mb-3 border-0 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h6 className="mb-0 fw-bold">
                  <i className="bi bi-tags text-primary me-2"></i>
                  Variant Attributes
                </h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAddAttribute}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Attribute
                </Button>
              </Card.Header>
              <Card.Body>
                {Object.keys(variantForm.attributes || {}).length === 0 ? (
                  <Alert variant="info" className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill fs-5 me-3 text-info"></i>
                    <div className="text-center w-100 my-3">
                      <p className="mb-2">No attributes defined</p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleAddAttribute}
                      >
                        <i className="bi bi-plus-circle me-1"></i> Add an
                        Attribute
                      </Button>
                    </div>
                  </Alert>
                ) : (
                  <Row className="g-3">
                    {Object.entries(variantForm.attributes).map(
                      ([key, value]) => (
                        <Col md={6} key={key}>
                          <Form.Group>
                            <Form.Label className="small fw-medium text-secondary">
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
                                  className="py-2"
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
                                  className="py-2"
                                />
                              )}
                              <Button
                                variant="outline-danger"
                                onClick={() => handleDeleteAttribute(key)}
                                className="px-3"
                              >
                                <i className="bi bi-x-lg"></i>
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
        <Modal.Footer className="border-0 pt-0">
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
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : editingVariant ? (
              <>
                <i className="bi bi-check-lg me-1"></i>
                Update Variant
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-1"></i>
                Add Variant
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={confirmDelete !== null}
        onHide={closeDeleteConfirmation}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Delete Variant
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the variant{" "}
            <strong>"{confirmDelete?.name}"</strong>? This action cannot be
            undone.
          </p>
          {confirmDelete && (
            <Alert variant="warning">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-circle me-2"></i>
                <div>
                  <strong className="d-block mb-1">Warning!</strong>
                  <p className="mb-0">
                    Deleting this variant will also affect any associated
                    inventory, orders, and images.
                  </p>
                </div>
              </div>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={closeDeleteConfirmation}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteVariant}>
            <i className="bi bi-trash me-1"></i>
            Delete Variant
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .form-switch-lg .form-check-input {
          width: 3em;
          height: 1.5em;
          margin-top: 0.1em;
        }
        .btn-icon {
          width: 35px;
          height: 35px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 50%;
        }
        .border-dashed {
          border: 2px dashed #dee2e6 !important;
        }
      `}</style>
    </div>
  );
};

export default VariantsManager;
