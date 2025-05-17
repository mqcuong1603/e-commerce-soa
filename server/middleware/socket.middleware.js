/**
 * Configures Socket.io event handlers and middleware
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {Object} logger - Logger instance
 */
export const configureSocketIO = (io, logger) => {
  // Simple connection handler
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join product review room
    socket.on("join_room", (room) => {
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room: ${room}`);
    });

    // Leave room
    socket.on("leave_room", (room) => {
      socket.leave(room);
      logger.info(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle real-time product reviews
    socket.on("new_review", (data) => {
      try {
        // Broadcast to everyone in the specific product room
        io.to(`product_review_${data.productId}`).emit("new_review", data);
        logger.info(`New review broadcast for product: ${data.productId}`);
      } catch (error) {
        logger.error(`Error broadcasting review: ${error.message}`);
      }
    });

    // Handle real-time rating updates
    socket.on("rating_updated", (data) => {
      try {
        io.to(`product_review_${data.productId}`).emit("rating_updated", data);
        logger.info(`Rating update broadcast for product: ${data.productId}`);
      } catch (error) {
        logger.error(`Error broadcasting rating update: ${error.message}`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.io configured successfully");
};
