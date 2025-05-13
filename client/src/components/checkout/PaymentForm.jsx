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
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "bank",
      name: "Bank Transfer",
      description: "Pay via bank transfer to our account",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
    },
    {
      id: "credit",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
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
    <div className="space-y-4">
      {/* Payment method selection */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-md p-4 cursor-pointer ${
              selectedMethod === method.id
                ? "border-primary-600 bg-primary-50"
                : "border-gray-300 hover:border-primary-300"
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 mr-2 ${
                  selectedMethod === method.id
                    ? "text-primary-600"
                    : "text-gray-500"
                }`}
              >
                {method.icon}
              </div>
              <div>
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-gray-600">
                  {method.description}
                </div>
              </div>
              <div className="ml-auto">
                <div
                  className={`rounded-full h-5 w-5 flex items-center justify-center ${
                    selectedMethod === method.id
                      ? "border-2 border-primary-600 bg-primary-600"
                      : "border border-gray-400"
                  }`}
                >
                  {selectedMethod === method.id && (
                    <div className="rounded-full h-2 w-2 bg-white"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show additional information based on selected payment method */}
      {selectedMethod === "bank" && (
        <div className="mt-6">
          <button
            type="button"
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            onClick={() => setShowBankDetails(!showBankDetails)}
          >
            <span>
              {showBankDetails ? "Hide Bank Details" : "Show Bank Details"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ml-1 transition-transform ${
                showBankDetails ? "transform rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showBankDetails && (
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-800 mb-2">
                Bank Transfer Details
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex">
                  <span className="w-32 text-gray-600">Bank Name:</span>
                  <span className="font-medium">{bankDetails.bankName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Account Number:</span>
                  <span className="font-medium">
                    {bankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Account Name:</span>
                  <span className="font-medium">{bankDetails.accountName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Branch:</span>
                  <span className="font-medium">{bankDetails.branch}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">SWIFT Code:</span>
                  <span className="font-medium">{bankDetails.swiftCode}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-700">Important:</span>{" "}
                  Please include your order number in the transfer description.
                </p>
                <p className="mt-1">
                  Your order will be processed once we've confirmed your
                  payment.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credit card form */}
      {selectedMethod === "credit" && (
        <div className="mt-6 p-4 border rounded-md">
          <h4 className="font-medium text-gray-800 mb-4">
            Credit Card Details
          </h4>

          <div className="space-y-4">
            {/* Card number */}
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleCardInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Cardholder name */}
            <div>
              <label
                htmlFor="cardName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cardholder Name
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={cardData.cardName}
                onChange={handleCardInputChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Expiry date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleCardInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center pt-2">
              <div className="flex-shrink-0 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600">
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
