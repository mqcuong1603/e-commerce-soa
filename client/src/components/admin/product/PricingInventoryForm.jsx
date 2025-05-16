import React from "react";
import { Form, Row, Col, InputGroup, Alert } from "react-bootstrap";

const PricingInventoryForm = ({ data, onChange, hasVariants }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...data,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const calculateDiscount = () => {
    if (!data.basePrice || !data.salePrice) return 0;
    const basePrice = parseFloat(data.basePrice);
    const salePrice = parseFloat(data.salePrice);
    if (basePrice <= 0 || salePrice <= 0 || salePrice >= basePrice) return 0;

    const discount = ((basePrice - salePrice) / basePrice) * 100;
    return Math.round(discount);
  };

  const discount = calculateDiscount();

  return (
    <div>
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Base Price*</Form.Label>
            <InputGroup>
              <InputGroup.Text>₫</InputGroup.Text>
              <Form.Control
                type="number"
                name="basePrice"
                value={data.basePrice || ""}
                onChange={handleChange}
                min="0"
                required
                placeholder="Regular price"
              />
            </InputGroup>
            <Form.Text className="text-muted">
              Regular price without discounts
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Sale Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>₫</InputGroup.Text>
              <Form.Control
                type="number"
                name="salePrice"
                value={data.salePrice || ""}
                onChange={handleChange}
                min="0"
                placeholder="Discounted price (if on sale)"
              />
              {discount > 0 && (
                <InputGroup.Text className="bg-danger text-white">
                  -{discount}%
                </InputGroup.Text>
              )}
            </InputGroup>
            <Form.Text className="text-muted">
              Optional discounted price
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Alert when sale price is higher than base price */}
      {data.salePrice &&
        parseFloat(data.salePrice) >= parseFloat(data.basePrice) && (
          <Alert variant="warning" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Sale price should be lower than the base price
          </Alert>
        )}

      {/* Inventory Management */}
      <div className="border-top pt-4 mt-2">
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Inventory Management</Form.Label>
          <div className="mb-3">
            <Form.Check
              type="checkbox"
              id="hasVariants"
              name="hasVariants"
              label="This product has multiple variants"
              checked={data.hasVariants || hasVariants}
              onChange={handleChange}
              disabled={hasVariants} // Disable if variants already exist
            />
            <Form.Text className="text-muted">
              Enable this if the product comes in different options like sizes,
              colors, etc.
            </Form.Text>
          </div>
        </Form.Group>

        {!data.hasVariants && !hasVariants && (
          <Form.Group className="mb-3">
            <Form.Label>Inventory Quantity*</Form.Label>
            <Form.Control
              type="number"
              name="inventory"
              value={data.inventory || "0"}
              onChange={handleChange}
              min="0"
              required={!data.hasVariants && !hasVariants}
              placeholder="Available quantity"
            />
            <Form.Text className="text-muted">
              Number of items in stock. Set to 0 if out of stock.
            </Form.Text>
          </Form.Group>
        )}

        {(data.hasVariants || hasVariants) && (
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Inventory will be managed through product variants. Please add
            variants after saving the basic product information.
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PricingInventoryForm;
