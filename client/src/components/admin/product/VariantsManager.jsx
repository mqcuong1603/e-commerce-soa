import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
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

  // Get unique attribute keys across all variants
  const attributeKeys = [
    ...new Set(variants.flatMap((v) => Object.keys(v.attributes || {}))),
  ];

  const handleOpenModal = (variant = null) => {
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
      setEditingVariant(null);
      setVariantForm({
        name: "",
        sku: `SKU-${Date.now()}`,
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
    setShowModal(false);
    setEditingVariant(null);
  };

  const handleVariantInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVariantForm({
      ...variantForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAttributeChange = (key, value) => {
    setVariantForm({
      ...variantForm,
      attributes: {
        ...variantForm.attributes,
        [key]: value,
      },
    });
  };

  const handleAddAttribute = () => {
    const newKey = prompt("Enter new attribute name:");
    if (newKey && !variantForm.attributes[newKey]) {
      setVariantForm({
        ...variantForm,
        attributes: {
          ...variantForm.attributes,
          [newKey]: "",
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
  };

  const handleSaveVariant = async () => {
    try {
      // Validate form
      if (!variantForm.name || !variantForm.price || variantForm.price <= 0) {
        toast.error("Please fill all required fields");
        return;
      }

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
              This product doesn't have any variants yet.
            </p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              Add First Variant
            </Button>
          </div>
        </Card>
      ) : (
        <Table responsive hover>
          <thead className="bg-light">
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Attributes</th>
              <th>Price</th>
              <th>Sale Price</th>
              <th>Inventory</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant._id}>
                <td>{variant.name}</td>
                <td>{variant.sku}</td>
                <td>
                  {variant.attributes &&
                    Object.entries(variant.attributes).map(([key, value]) => (
                      <span
                        className="badge bg-light text-dark me-1 mb-1"
                        key={key}
                      >
                        {key}: {value}
                      </span>
                    ))}
                </td>
                <td>₫{variant.price?.toLocaleString()}</td>
                <td>
                  {variant.salePrice
                    ? `₫${variant.salePrice?.toLocaleString()}`
                    : "-"}
                </td>
                <td>{variant.inventory}</td>
                <td>
                  <span
                    className={`badge ${
                      variant.isActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {variant.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
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
      )}

      {/* Variant Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
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
                    placeholder="e.g., Blue, 8GB, Small"
                  />
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
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price*</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₫</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="price"
                      value={variantForm.price}
                      onChange={handleVariantInputChange}
                      min="0"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sale Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₫</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="salePrice"
                      value={variantForm.salePrice}
                      onChange={handleVariantInputChange}
                      min="0"
                    />
                  </InputGroup>
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
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                checked={variantForm.isActive}
                onChange={handleVariantInputChange}
                label="Variant is active"
              />
            </Form.Group>

            <Card className="mt-4 mb-3">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h6 className="mb-0">Variant Attributes</h6>
                <Button
                  variant="outline-secondary"
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
                          <InputGroup>
                            <InputGroup.Text>{key}</InputGroup.Text>
                            <Form.Control
                              value={value}
                              onChange={(e) =>
                                handleAttributeChange(key, e.target.value)
                              }
                              placeholder={`Value for ${key}`}
                            />
                            <Button
                              variant="outline-danger"
                              onClick={() => handleDeleteAttribute(key)}
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                          </InputGroup>
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
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveVariant}>
            {editingVariant ? "Update Variant" : "Add Variant"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VariantsManager;
