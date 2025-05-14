import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

/**
 * 404 Not Found page
 * Displayed when a user navigates to a non-existent route
 */
const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button variant="primary">Return Home</Button>
          </Link>
          <Link to="/products">
            <Button variant="outlined">Browse Products</Button>
          </Link>
        </div>

        {/* Suggested links */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            You might be interested in:
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/category/laptops"
              className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200"
            >
              Laptops
            </Link>
            <Link
              to="/category/monitors"
              className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200"
            >
              Monitors
            </Link>
            <Link
              to="/category/graphics-cards"
              className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200"
            >
              Graphics Cards
            </Link>
            <Link
              to="/category/processors"
              className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200"
            >
              Processors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
