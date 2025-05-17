import { useState, useEffect } from "react";
import productService from "../services/product.service";
import io from "socket.io-client";

/**
 * Custom hook for managing product reviews with socket.io integration
 * @param {string} productId - The product ID to fetch reviews for
 * @returns {Object} Reviews state and methods with real-time updates
 */
const useReviews = (productId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // Socket.io connection and event handling with improved reconnection
  useEffect(() => {
    let socketInstance = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    // Function to establish socket connection
    const connectSocket = () => {
      try {
        // Create socket connection with better configuration
        socketInstance = io(
          process.env.REACT_APP_API_URL || "http://localhost:3000",
          {
            path: "/socket.io",
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
          }
        );

        setSocket(socketInstance);

        // Socket event handlers
        socketInstance.on("connect", () => {
          console.log("Socket.io connected successfully");
          setIsConnected(true);
          reconnectAttempts = 0;

          // Join product review room
          socketInstance.emit("join_room", `product_review_${productId}`);
        });

        socketInstance.on("connect_error", (err) => {
          console.error("Socket.io connection error:", err.message);
          setIsConnected(false);

          // Manual reconnection logic if needed
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(reconnectAttempts * 1000, 5000);
            console.log(
              `Will attempt to reconnect in ${delay}ms (${reconnectAttempts}/${maxReconnectAttempts})`
            );

            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(connectSocket, delay);
          }
        });

        socketInstance.on("disconnect", (reason) => {
          console.log(`Socket disconnected: ${reason}`);
          setIsConnected(false);
        });
      } catch (err) {
        console.error("Failed to initialize socket connection:", err);
        setIsConnected(false);
      }
    };

    // Initial connection
    connectSocket();

    // Cleanup on component unmount
    return () => {
      clearTimeout(reconnectTimer);

      if (socketInstance) {
        try {
          socketInstance.emit("leave_room", `product_review_${productId}`);
          socketInstance.disconnect();
        } catch (err) {
          console.error("Error during socket cleanup:", err);
        }
      }
    };
  }, [productId]);
  // Set up listeners for real-time updates with improved error handling
  useEffect(() => {
    if (!socket) return;

    // Listen for new reviews
    socket.on("new_review", (newReview) => {
      try {
        if (newReview.productId === productId) {
          setReviews((prev) => {
            // Prevent duplicate entries by checking if the review already exists
            const isDuplicate = prev.some(
              (review) => review._id === newReview._id
            );
            if (isDuplicate) return prev;
            return [newReview, ...prev];
          });
        }
      } catch (error) {
        console.error("Error handling new review:", error);
      }
    });

    // Listen for rating updates
    socket.on("rating_updated", (data) => {
      try {
        if (data.productId === productId) {
          // You might want to trigger some UI update here
          console.log("Product rating updated:", data);
        }
      } catch (error) {
        console.error("Error handling rating update:", error);
      }
    });

    // Handle potential socket errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      // Clean up all listeners to prevent memory leaks
      socket.off("new_review");
      socket.off("rating_updated");
      socket.off("error");
    };
  }, [socket, productId]);

  // Load reviews on initial mount and page changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productService.getProductReviews(productId, {
          page,
          limit: 10,
        });

        if (response.success) {
          if (page === 1) {
            setReviews(response.data.reviews);
          } else {
            setReviews((prev) => [...prev, ...response.data.reviews]);
          }

          setHasMore(response.data.pagination.hasNextPage);
        } else {
          setError("Failed to load reviews");
        }
      } catch (err) {
        setError("Error loading reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  // Function to submit a new review
  const submitReview = async (reviewData) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await productService.addProductReview(
        productId,
        reviewData
      );

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Failed to submit review");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = "Error submitting review. Please try again.";
      setError(errorMessage);
      console.error("Error submitting review:", err);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Load more reviews
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };
  return {
    reviews,
    loading,
    submitting,
    error,
    hasMore,
    isConnected,
    submitReview,
    loadMore,
  };
};

export default useReviews;
