import Cart from "../models/cart.model.js";

/**
 * Middleware to get or create a cart
 * This handles both logged in users (using userId) and guests (using sessionId)
 */
export const cartMiddleware = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const sessionId = req.session.id;

    let cart;

    // If user is logged in, find cart by userId
    if (userId) {
      cart = await Cart.findOne({ userId });

      // If user has a cart but was previously shopping as guest,
      // check for a session cart and merge them
      if (!cart) {
        const sessionCart = await Cart.findOne({ sessionId });

        if (sessionCart) {
          // Transfer ownership of the session cart to the user
          await sessionCart.transferCart(userId);
          cart = sessionCart;
        } else {
          // Create new cart for user
          cart = new Cart({ userId });
          await cart.save();
        }
      }
    } else {
      // Guest user - find cart by sessionId or create a new one
      cart = await Cart.findOne({ sessionId });

      if (!cart) {
        cart = new Cart({ sessionId });
        await cart.save();
      }
    }

    // Populate the cart with product details
    await cart.populate({
      path: "items.productVariantId",
      populate: [
        {
          path: "productId",
          select: "name slug brand",
        },
        {
          path: "images",
          match: { isMain: true },
          options: { limit: 1 },
        },
      ],
    });

    req.cart = cart;
    next();
  } catch (error) {
    next(error);
  }
};
