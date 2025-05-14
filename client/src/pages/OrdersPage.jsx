import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/order.service";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import Card from "../components/ui/Card";

/**
 * Orders Page component
 * Displays the user's order history with pagination
 */
const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/orders" } },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders when component mounts or pagination changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(pagination.page, pagination.limit);
    }
  }, [isAuthenticated, pagination.page, pagination.limit]);

  // Fetch orders from API
  const fetchOrders = async (page, limit) => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getUserOrders({
        page,
        limit,
      });

      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  // Format price with comma for thousands
  const formatPrice = (price) => {
    return price?.toLocaleString("en-US") || "0";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get status badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "shipping":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format order status for display
  const formatStatus = (status) => {
    if (!status) return "";
    // Capitalize first letter and replace dashes with spaces
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loader text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order._id}
              className="p-0 overflow-hidden"
              hoverable
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        order.status[0]?.status
                      )}`}
                    >
                      {formatStatus(order.status[0]?.status)}
                    </span>
                    <span className="ml-4 font-bold">
                      ₫{formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                {/* Order items preview */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item._id}
                        className="flex-shrink-0 w-16 h-16 border rounded-md overflow-hidden bg-white"
                      >
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {order.items.length > 4 && (
                      <div className="flex-shrink-0 w-16 h-16 border rounded-md bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          +{order.items.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order actions */}
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t">
                <div className="text-sm text-gray-500">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </div>
                <Button
                  variant="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order._id}`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav aria-label="Pagination">
                <ul className="flex items-center">
                  {/* Previous page button */}
                  <li>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                        pagination.page === 1
                          ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                      aria-label="Previous"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>

                  {/* Page numbers */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show current page, first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.page - 1 &&
                        pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <li key={pageNumber}>
                          <button
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              pageNumber === pagination.page
                                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    } else if (
                      (pageNumber === 2 && pagination.page > 3) ||
                      (pageNumber === pagination.totalPages - 1 &&
                        pagination.page < pagination.totalPages - 2)
                    ) {
                      // Show ellipsis
                      return (
                        <li key={pageNumber}>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700">
                            ...
                          </span>
                        </li>
                      );
                    }
                    return null;
                  })}

                  {/* Next page button */}
                  <li>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                        pagination.page === pagination.totalPages
                          ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                      aria-label="Next"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping to place your
            first order!
          </p>
          <Button variant="primary" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
