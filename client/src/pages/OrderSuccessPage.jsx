import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { formatPrice } from "../utils/formatter.js";

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, isGuestCheckout, guestEmail } = location.state || {};

  // If no order data is present, redirect to home
  React.useEffect(() => {
    if (!order) {
      navigate("/", { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>
                <h1 className="h3 fw-bold">Order Successfully Placed!</h1>
                <p className="text-muted">
                  Thank you for your purchase. Your order has been received and
                  is being processed.
                </p>
              </div>

              <div className="bg-light p-4 rounded-3 mb-4">
                <h5 className="fw-bold mb-3">Order Details</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <span className="text-muted d-block">Order Number:</span>
                    <span className="fw-medium">{order.orderNumber}</span>
                  </div>
                  <div className="col-md-6 mb-3">
                    <span className="text-muted d-block">Date:</span>
                    <span className="fw-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="col-12 mb-3">
                    <span className="text-muted d-block">Total Amount:</span>
                    <span className="fw-medium fs-5">
                      ₫{formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {isGuestCheckout && (
                <Alert variant="info" className="mb-4">
                  <h5 className="alert-heading fw-bold">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Your Account Has Been Created!
                  </h5>
                  <p>
                    We've automatically created an account for you using your
                    email address:
                    <strong> {guestEmail}</strong>
                  </p>
                  <hr />
                  <p className="mb-0">
                    Check your email for login instructions. You can use this
                    account to:
                  </p>
                  <ul className="mt-2 mb-0">
                    <li>Track your current order</li>
                    <li>View your order history</li>
                    <li>Save your shipping address for future purchases</li>
                  </ul>
                </Alert>
              )}

              <div className="d-flex flex-column flex-md-row gap-3 mt-4">
                <Button
                  variant="outline-secondary"
                  className="flex-fill"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-house me-2"></i>
                  Return to Home
                </Button>

                <Button
                  variant="danger"
                  className="flex-fill"
                  onClick={() =>
                    isGuestCheckout
                      ? navigate("/login")
                      : navigate(`/orders/${order._id}`)
                  }
                >
                  {isGuestCheckout ? (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login to View Order
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box me-2"></i>
                      View Order Details
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccessPage;
