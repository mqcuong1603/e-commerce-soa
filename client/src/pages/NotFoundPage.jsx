import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

/**
 * 404 Not Found page
 * Displayed when a user navigates to a non-existent route
 */
const NotFoundPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 text-center">
          <h1 className="display-1 fw-bold text-danger mb-3">404</h1>

          <Card className="mb-4 p-5">
            <h2 className="h3 fw-bold mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you are looking for doesn't exist or has been moved.
            </p>

            <div className="d-flex gap-3 justify-content-center">
              <Link to="/">
                <Button variant="primary">Return Home</Button>
              </Link>
              <Link to="/products">
                <Button variant="outlined">Browse Products</Button>
              </Link>
            </div>
          </Card>

          {/* Suggested links */}
          <div className="mt-4">
            <h3 className="h5 fw-bold mb-3">You might be interested in:</h3>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Link
                to="/category/laptops"
                className="btn btn-outline-secondary rounded-pill"
              >
                <i className="bi bi-laptop me-2"></i>
                Laptops
              </Link>
              <Link
                to="/category/monitors"
                className="btn btn-outline-secondary rounded-pill"
              >
                <i className="bi bi-display me-2"></i>
                Monitors
              </Link>
              <Link
                to="/category/graphics-cards"
                className="btn btn-outline-secondary rounded-pill"
              >
                <i className="bi bi-gpu-card me-2"></i>
                Graphics Cards
              </Link>
              <Link
                to="/category/processors"
                className="btn btn-outline-secondary rounded-pill"
              >
                <i className="bi bi-cpu me-2"></i>
                Processors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
