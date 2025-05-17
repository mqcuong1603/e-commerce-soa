import Cart from "../models/cart.model.js";

export const cartMiddleware = async (req, res, next) => {
  try {
    // Use Express session ID consistently
    const sessionId = req.sessionID || req.session.id;
    console.log(`Using Express session ID: ${sessionId}`);

    let cart;

    // For logged-in users
    if (req.user && req.user._id) {
      cart = await Cart.findOne({ userId: req.user._id }).populate({
        path: "items.productVariantId",
        populate: [
          {
            path: "productId",
            select: "name images",
            populate: { path: "images" },
          },
          { path: "images" },
        ],
      });

      if (!cart) {
        // Look for a session cart and transfer ownership
        const sessionCart = await Cart.findOne({ sessionId }).populate({
          path: "items.productVariantId",
          populate: [
            {
              path: "productId",
              select: "name images",
              populate: { path: "images" },
            },
            { path: "images" },
          ],
        });

        if (sessionCart) {
          sessionCart.userId = req.user._id;
          cart = await sessionCart.save();
          console.log("Transferred session cart to user");
        } else {
          cart = new Cart({ userId: req.user._id, sessionId });
          await cart.save();
          console.log("Created new user cart");
        }
      }
    } else {
      // Handle guest users with session
      cart = await Cart.findOne({ sessionId }).populate({
        path: "items.productVariantId",
        populate: [
          {
            path: "productId",
            select: "name images",
            populate: { path: "images" },
          },
          { path: "images" },
        ],
      });

      if (!cart) {
        // Create a new cart for this session
        cart = new Cart({ sessionId });
        await cart.save();
        console.log(`Created new cart for session ${sessionId}`);
      } else {
        console.log(`Found existing cart for session ${sessionId}`);
      }
    }

    // Store cart in the request for controllers to use
    req.cart = cart;

    // Debug log cart status
    console.log(
      `Cart status: ${req.cart._id}, Items: ${req.cart.items.length}`
    );

    // If cart is empty for a checkout request, return an error
    if (
      req.originalUrl === "/api/orders" &&
      req.method === "POST" &&
      (!req.cart.items || req.cart.items.length === 0)
    ) {
      console.error("Attempted checkout with empty cart");
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items before checking out.",
      });
    }

    next();
  } catch (error) {
    console.error("Cart middleware error:", error);
    next(error);
  }
};
