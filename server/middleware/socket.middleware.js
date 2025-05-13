/**
 * Configures Socket.io event handlers and middleware
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {Object} logger - Logger instance
 */
export const configureSocketIO = (io, logger) => {
  // Add middleware to Socket.io for authentication if needed
  // io.use((socket, next) => {
  //   // Example: token validation middleware
  //   const token = socket.handshake.auth.token;
  //   // Validate token and set socket.user
  //   next();
  // });

  // Connection handler
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Handle real-time product reviews
    socket.on("new_review", (data) => {
      try {
        // Real-time product reviews - allows users to see new reviews immediately
        socket.broadcast.emit("review_update", data);
        logger.info(`New review broadcast from ${socket.id}`);
      } catch (error) {
        logger.error(`Error broadcasting review: ${error.message}`, error);
      }
    });

    // Handle real-time cart updates
    socket.on("cart_update", (data) => {
      try {
        // Real-time cart updates - keeps cart synchronized across devices/tabs
        socket.broadcast.emit("cart_changed", data);
        logger.info(`Cart update broadcast from ${socket.id}`);
      } catch (error) {
        logger.error(`Error broadcasting cart update: ${error.message}`, error);
      }
    });

    // Handle Socket.io errors
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}: ${error.message}`, error);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.io configured successfully");
};
