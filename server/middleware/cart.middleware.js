import Cart from "../models/cart.model.js";

export const cartMiddleware = async (req, res, next) => {
  try {
    // Use Express session ID consistently
    const sessionId = req.sessionID || req.session.id;
    console.log(`Using Express session ID: ${sessionId}`);

    let cart;

    // For logged-in users
    if (req.user && req.user._id) {
      cart = await Cart.findOne({ userId: req.user._id });

      if (!cart) {
        // Look for a session cart and transfer ownership
        const sessionCart = await Cart.findOne({ sessionId });

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
      cart = await Cart.findOne({ sessionId });

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
    next();
  } catch (error) {
    next(error);
  }
};
