import React from "react";
import { Form, Row, Col, InputGroup, Alert, Card } from "react-bootstrap";

const PricingInventoryForm = ({ data, onChange, hasVariants }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...data,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Pricing Information</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Base Price* (Reference price for the product)
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text>₫</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={data.basePrice || ""}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="Base reference price"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  The base price serves as a reference price for the product.
                  Actual pricing and discounts are managed per variant.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="info" className="d-flex align-items-center">
            <i className="bi bi-info-circle fs-5 me-2"></i>
            <div>
              <strong>Pricing and Inventory Management</strong>
              <p className="mb-0">
                Specific prices, sale prices, and inventory quantities are
                managed at the variant level. Please define these values for
                each variant in the Variants tab.
              </p>
            </div>
          </Alert>
        </Card.Body>
      </Card>

      {/* Variant Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Product Variants</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="hasVariants"
              name="hasVariants"
              label="This product has multiple variants"
              checked={data.hasVariants || hasVariants}
              onChange={handleChange}
              disabled={hasVariants} // Disable if variants already exist
            />
            <Form.Text className="text-muted">
              Enable this if the product comes in different options like sizes,
              colors, capacities, etc.
            </Form.Text>
          </Form.Group>

          {hasVariants ? (
            <Alert variant="success">
              <i className="bi bi-check-circle me-2"></i>
              This product has variants. Manage them in the "Variants" tab.
            </Alert>
          ) : (
            <Alert variant={data.hasVariants ? "info" : "warning"}>
              {data.hasVariants ? (
                <>
                  <i className="bi bi-exclamation-circle me-2"></i>
                  Add variants for this product in the "Variants" tab after
                  saving.
                </>
              ) : (
                <>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  This product has no variants. Each product requires at least
                  one variant to manage inventory and final pricing.
                </>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PricingInventoryForm;
