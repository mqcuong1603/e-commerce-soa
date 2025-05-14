import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialIcons = [
    {
      name: "Facebook",
      icon: "bi-facebook",
      bgClass: "bg-primary",
      url: "https://facebook.com",
    },
    {
      name: "Twitter",
      icon: "bi-twitter",
      bgClass: "bg-info",
      url: "https://twitter.com",
    },
    {
      name: "Instagram",
      icon: "bi-instagram",
      bgClass: "bg-danger",
      url: "https://instagram.com",
    },
    {
      name: "YouTube",
      icon: "bi-youtube",
      bgClass: "bg-danger",
      url: "https://youtube.com",
    },
  ];

  const paymentMethods = [
    {
      name: "Credit Card",
      icon: "bi-credit-card-2-front",
      bgClass: "bg-warning bg-opacity-25",
    },
    { name: "PayPal", icon: "bi-paypal", bgClass: "bg-info bg-opacity-25" },
    {
      name: "Digital Wallet",
      icon: "bi-wallet2",
      bgClass: "bg-primary bg-opacity-25",
    },
    {
      name: "Bank Transfer",
      icon: "bi-bank",
      bgClass: "bg-success bg-opacity-25",
    },
  ];

  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row g-4">
          {/* Column 1 - Logo and Info */}
          <div className="col-md-4">
            <h3 className="fw-bold mb-3 text-danger">TechStore</h3>
            <p className="text-white-50">Your premium tech destination</p>

            <div className="d-flex flex-column gap-2 mt-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill text-info me-2"></i>
                <span>123 Tech Street</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-telephone-fill text-info me-2"></i>
                <span>1-800-TECH</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Newsletter */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 text-danger">Get the latest updates</h5>
            <div className="bg-dark bg-opacity-75 p-3 rounded-3 shadow-sm border border-secondary">
              <div className="input-group">
                <input
                  type="email"
                  className="form-control bg-transparent text-white border-secondary"
                  placeholder="Your email address"
                  aria-label="Subscribe to newsletter"
                />
                <button className="btn btn-danger" type="button">
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Column 3 - Social & Payment */}
          <div className="col-md-4">
            {/* Social Section */}
            <h5 className="fw-bold mb-3 text-info text-md-end">
              Connect with us
            </h5>
            <div className="d-flex justify-content-md-end gap-3 mb-4 flex-wrap">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={`${social.bgClass} text-white p-2 rounded-circle hover-shadow`}
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`bi ${social.icon}`}></i>
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <h5 className="fw-bold mb-3 text-info text-md-end">
              Payment Methods
            </h5>
            <div className="d-flex justify-content-md-end gap-2 flex-wrap">
              {paymentMethods.map((method, index) => (
                <span
                  key={index}
                  className={`${method.bgClass} p-2 rounded-3`}
                  title={method.name}
                >
                  <i className={`bi ${method.icon} fs-5`}></i>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Links and Copyright */}
        <div className="border-top border-secondary pt-4 mt-4">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="text-danger fw-bold">
                © {currentYear} TechStore. All rights reserved.
              </div>
            </div>
            <div className="col-md-6">
              <ul className="list-inline mb-0 text-md-end">
                <li className="list-inline-item">
                  <Link
                    to="/privacy-policy"
                    className="text-decoration-none text-info"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li className="list-inline-item ms-3">
                  <Link
                    to="/terms-of-service"
                    className="text-decoration-none text-info"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li className="list-inline-item ms-3">
                  <Link
                    to="/shipping-policy"
                    className="text-decoration-none text-info"
                  >
                    Shipping Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
