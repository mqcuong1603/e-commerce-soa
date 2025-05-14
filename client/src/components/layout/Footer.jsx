import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row gy-4">
          {/* About section */}
          <div className="col-lg-4 col-md-6">
            <h5 className="mb-3 fw-bold">About TechStore</h5>
            <p className="text-white-50 mb-3">
              TechStore is your one-stop destination for high-quality computer
              components and tech products at competitive prices.
            </p>
            <div className="d-flex gap-3">
              <a
                href="https://facebook.com"
                className="text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a
                href="https://twitter.com"
                className="text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a
                href="https://instagram.com"
                className="text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a
                href="https://youtube.com"
                className="text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-youtube fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="mb-3 fw-bold">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/products"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Products
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/cart"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Cart
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/contact"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-6">
            <h5 className="mb-3 fw-bold">Categories</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/category/laptops"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Laptops
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/category/monitors"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Monitors
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/category/storage"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Storage
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/category/processors"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Processors
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/category/graphics-cards"
                  className="text-white-50 text-decoration-none hover-text-white"
                >
                  Graphics Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-6">
            <h5 className="mb-3 fw-bold">Contact Information</h5>
            <ul className="list-unstyled">
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                <span>
                  123 Tech Street, District 1, Ho Chi Minh City, Vietnam
                </span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone-fill text-danger me-2"></i>
                <span>+84 123 456 789</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-envelope-fill text-danger me-2"></i>
                <span>info@techstore.com</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-clock-fill text-danger me-2"></i>
                <div>
                  <div>Mon - Fri: 9:00 AM - 8:00 PM</div>
                  <div>Sat - Sun: 9:00 AM - 6:00 PM</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="row mt-4">
          <div className="col-lg-6 mx-auto">
            <h5 className="mb-3 text-center fw-bold">
              Subscribe to Our Newsletter
            </h5>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Your email address"
                aria-label="Your email address"
              />
              <button className="btn btn-danger" type="button">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            <h5 className="mb-3 fw-bold">We Accept</h5>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <span className="bg-white p-2 rounded">
                <i className="bi bi-credit-card fs-4 text-dark"></i>
              </span>
              <span className="bg-white p-2 rounded">
                <i className="bi bi-paypal fs-4 text-dark"></i>
              </span>
              <span className="bg-white p-2 rounded">
                <i className="bi bi-wallet2 fs-4 text-dark"></i>
              </span>
              <span className="bg-white p-2 rounded">
                <i className="bi bi-bank fs-4 text-dark"></i>
              </span>
              <span className="bg-white p-2 rounded">
                <i className="bi bi-currency-exchange fs-4 text-dark"></i>
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-top mt-4 pt-4 text-center text-white-50">
          <p className="mb-1">
            &copy; {currentYear} TechStore. All rights reserved.
          </p>
          <div>
            <Link
              to="/privacy-policy"
              className="text-white-50 text-decoration-none mx-2 small"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-white-50 text-decoration-none mx-2 small"
            >
              Terms of Service
            </Link>
            <Link
              to="/shipping-policy"
              className="text-white-50 text-decoration-none mx-2 small"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
