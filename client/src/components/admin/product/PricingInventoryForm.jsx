import React from "react";
import {
  Form,
  Row,
  Col,
  InputGroup,
  Alert,
  Card,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

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
      <Card className="shadow border-0 mb-4">
        <Card.Header className="bg-white border-bottom border-light py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-currency-dollar text-primary me-2"></i>
            Pricing Information
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold text-secondary">
                  Base Price* (Reference price for the product)
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    ₫
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="basePrice"
                    value={data.basePrice || ""}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="Base reference price"
                    className="py-2 form-control-lg"
                  />
                </InputGroup>
                <Form.Text className="text-muted mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  The base price serves as a reference price for the product.
                  Actual pricing and discounts are managed per variant.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="info" className="d-flex border-left-info">
            <i className="bi bi-info-circle-fill fs-4 me-3 text-info"></i>
            <div>
              <strong className="d-block mb-2">
                Pricing and Inventory Management
              </strong>
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
      <Card className="shadow border-0 mb-4">
        <Card.Header className="bg-white border-bottom border-light py-3">
          <h5 className="mb-0 fw-semibold d-flex align-items-center">
            <i className="bi bi-boxes text-primary me-2"></i>
            Product Variants
            {hasVariants && (
              <Badge bg="success" pill className="ms-2">
                Enabled
              </Badge>
            )}
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="variant-option-container p-4 rounded-3 bg-light mb-4">
            <div className="d-flex align-items-center mb-3">
              <Form.Check
                type="switch"
                id="hasVariants"
                name="hasVariants"
                label={
                  <span className="fw-medium fs-5">
                    This product has multiple variants
                  </span>
                }
                checked={data.hasVariants || hasVariants}
                onChange={handleChange}
                disabled={hasVariants} // Disable if variants already exist
                className="form-switch-lg"
              />
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip>
                    Enable this if the product comes in different options like
                    sizes, colors, or capacities
                  </Tooltip>
                }
              >
                <i className="bi bi-question-circle ms-2 text-muted"></i>
              </OverlayTrigger>
            </div>
            <Form.Text className="text-muted ms-4 mb-2 d-block">
              Enable this if the product comes in different options like sizes,
              colors, capacities, etc.
            </Form.Text>
          </div>

          {hasVariants ? (
            <Alert
              variant="success"
              className="d-flex border-left-success mb-0"
            >
              <i className="bi bi-check-circle-fill fs-4 me-3 text-success"></i>
              <div>
                <strong className="d-block mb-1">Variants Configured</strong>
                <p className="mb-0">
                  This product has variants. Manage them in the "Variants" tab.
                </p>
              </div>
            </Alert>
          ) : (
            <Alert
              variant={data.hasVariants ? "info" : "warning"}
              className={`d-flex ${
                data.hasVariants ? "border-left-info" : "border-left-warning"
              } mb-0`}
            >
              {data.hasVariants ? (
                <>
                  <i className="bi bi-exclamation-circle-fill fs-4 me-3 text-info"></i>
                  <div>
                    <strong className="d-block mb-1">Add Variants</strong>
                    <p className="mb-0">
                      Add variants for this product in the "Variants" tab after
                      saving.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-warning"></i>
                  <div>
                    <strong className="d-block mb-1">
                      No Variants Configured
                    </strong>
                    <p className="mb-0">
                      This product has no variants. Each product requires at
                      least one variant to manage inventory and final pricing.
                    </p>
                  </div>
                </>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <style jsx>{`
        .form-switch-lg .form-check-input {
          width: 3em;
          height: 1.5em;
          margin-top: 0.1em;
        }
        .variant-option-container {
          border: 1px solid #dee2e6;
          transition: all 0.2s ease;
        }
        .variant-option-container:hover {
          border-color: #6c757d;
        }
        .border-left-info {
          border-left: 4px solid #0dcaf0 !important;
        }
        .border-left-success {
          border-left: 4px solid #198754 !important;
        }
        .border-left-warning {
          border-left: 4px solid #ffc107 !important;
        }
      `}</style>
    </div>
  );
};

export default PricingInventoryForm;
