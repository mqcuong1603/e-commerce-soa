import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * Payment form component for selecting payment methods during checkout
 */
const PaymentForm = ({ selectedMethod, onSelectMethod }) => {
  // Available payment methods
  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay with cash when your order is delivered",
      icon: <i className="bi bi-cash-coin fs-4"></i>,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      description: "Pay via bank transfer to our account",
      icon: <i className="bi bi-bank fs-4"></i>,
    },
    {
      id: "credit",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: <i className="bi bi-credit-card fs-4"></i>,
    },
  ];

  // Bank transfer details
  const [showBankDetails, setShowBankDetails] = useState(false);
  const bankDetails = {
    bankName: "VietcomBank",
    accountNumber: "1234567890",
    accountName: "TechStore JSC",
    branch: "Ho Chi Minh City",
    swiftCode: "VTCBVNVX",
  };

  // Credit card state
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === "cardNumber") {
      let formatted = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      setCardData({ ...cardData, [name]: formatted });
      return;
    }

    // Format expiry date
    if (name === "expiryDate") {
      let formatted = value.replace(/\D/g, "");
      if (formatted.length > 2) {
        formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
      }
      setCardData({ ...cardData, [name]: formatted });
      return;
    }

    setCardData({ ...cardData, [name]: value });
  };

  return (
    <div>
      {/* Payment method selection */}
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className={`card mb-3 ${
            selectedMethod === method.id ? "border-danger" : "border"
          }`}
          onClick={() => onSelectMethod(method.id)}
          style={{ cursor: "pointer" }}
        >
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div
                className={`me-3 ${
                  selectedMethod === method.id ? "text-danger" : "text-muted"
                }`}
              >
                {method.icon}
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-0">{method.name}</h6>
                <p className="text-muted small mb-0">{method.description}</p>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id={`payment-${method.id}`}
                  checked={selectedMethod === method.id}
                  onChange={() => onSelectMethod(method.id)}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Show additional information based on selected payment method */}
      {selectedMethod === "bank" && (
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 d-flex align-items-center"
            onClick={() => setShowBankDetails(!showBankDetails)}
          >
            <span className="text-danger">
              {showBankDetails ? "Hide Bank Details" : "Show Bank Details"}
            </span>
            <i
              className={`bi bi-chevron-${
                showBankDetails ? "up" : "down"
              } ms-1`}
            ></i>
          </button>

          {showBankDetails && (
            <div className="card mt-3 bg-light">
              <div className="card-body">
                <h6 className="mb-3">Bank Transfer Details</h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">Bank Name:</span>
                      <div className="fw-medium">{bankDetails.bankName}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">Account Number:</span>
                      <div className="fw-medium">
                        {bankDetails.accountNumber}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">Account Name:</span>
                      <div className="fw-medium">{bankDetails.accountName}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">Branch:</span>
                      <div className="fw-medium">{bankDetails.branch}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <span className="text-muted small">SWIFT Code:</span>
                      <div className="fw-medium">{bankDetails.swiftCode}</div>
                    </div>
                  </div>
                </div>
                <div className="alert alert-warning mt-3 py-2 mb-0">
                  <strong>Important:</strong> Please include your order number
                  in the transfer description. Your order will be processed once
                  we've confirmed your payment.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credit card form */}
      {selectedMethod === "credit" && (
        <div className="card mt-3">
          <div className="card-body">
            <h6 className="mb-3">Credit Card Details</h6>

            <div className="row g-3">
              {/* Card number */}
              <div className="col-12">
                <label htmlFor="cardNumber" className="form-label">
                  Card Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cardNumber"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>

              {/* Cardholder name */}
              <div className="col-12">
                <label htmlFor="cardName" className="form-label">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cardName"
                  name="cardName"
                  value={cardData.cardName}
                  onChange={handleCardInputChange}
                  placeholder="John Doe"
                />
              </div>

              {/* Expiry date and CVV */}
              <div className="col-sm-6">
                <label htmlFor="expiryDate" className="form-label">
                  Expiry Date
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleCardInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>

              <div className="col-sm-6">
                <label htmlFor="cvv" className="form-label">
                  CVV
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="cvv"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>

            <div className="mt-3 d-flex align-items-center">
              <i className="bi bi-shield-lock-fill text-success me-2"></i>
              <span className="small text-muted">
                Your payment info is secure and encrypted
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PaymentForm.propTypes = {
  selectedMethod: PropTypes.string.isRequired,
  onSelectMethod: PropTypes.func.isRequired,
};

export default PaymentForm;
