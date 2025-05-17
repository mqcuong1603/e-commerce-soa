import Cart from "../models/cart.model.js";

export const cartMiddleware = async (req, res, next) => {
  try {
    // Use Express session ID consistently
    const sessionId = req.sessionID || req.session.id;
    console.log(`Using Express session ID: ${sessionId}`);

    let cart; // Check if there are multiple carts for the same user/session (problematic)
    let existingCarts = [];

    if (req.user && req.user._id) {
      // For logged-in users, get all their carts
      existingCarts = await Cart.find({ userId: req.user._id });

      // Also check session carts that might need to be transferred
      const sessionCarts = await Cart.find({ sessionId });
      if (sessionCarts.length > 0) {
        existingCarts = [...existingCarts, ...sessionCarts];
      }
    } else {
      // For guest users, check session carts
      existingCarts = await Cart.find({ sessionId });
    }

    if (existingCarts.length > 1) {
      console.log(
        `Found ${existingCarts.length} carts for ${
          req.user ? "user " + req.user._id : "session " + sessionId
        }, cleaning up...`
      );

      // First, look for a cart saved in the session
      let cartToKeep = null;
      if (req.session.cartId) {
        cartToKeep = existingCarts.find(
          (c) => c._id.toString() === req.session.cartId
        );
      }

      // If no cart from session, look for one with items
      if (!cartToKeep) {
        cartToKeep = existingCarts.find((c) => c.items && c.items.length > 0);
      }

      // If still no cart to keep, use the newest one
      if (!cartToKeep) {
        existingCarts.sort((a, b) => b.createdAt - a.createdAt);
        cartToKeep = existingCarts[0];
      }

      // Delete all other carts
      for (const c of existingCarts) {
        if (c._id.toString() !== cartToKeep._id.toString()) {
          console.log(`Removing duplicate cart ${c._id}`);
          await Cart.findByIdAndDelete(c._id);
        }
      }

      // Make sure the cartId in session matches the cart we're keeping
      req.session.cartId = cartToKeep._id.toString();
    } // Check if this is a request that needs to create a cart if none exists
    const needsCart =
      !req.originalUrl.includes("/api/orders") || req.method !== "POST"; // For logged-in users
    if (req.user && req.user._id) {
      // First, check if we have a cart ID stored in the session
      if (req.session.cartId) {
        console.log(`Using cart ID from session: ${req.session.cartId}`);

        // Try to find the cart by its ID first
        cart = await Cart.findById(req.session.cartId).populate({
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

        // If found, ensure it belongs to this user
        if (cart) {
          if (!cart.userId || !cart.userId.equals(req.user._id)) {
            cart.userId = req.user._id;
            cart = await cart.save();
            console.log(
              `Updated cart ${cart._id} to belong to user ${req.user._id}`
            );
          }
        }
      }

      // If no cart from session ID, look for user's carts
      if (!cart) {
        const userCarts = await Cart.find({ userId: req.user._id });

        if (userCarts.length > 0) {
          console.log(
            `Found ${userCarts.length} carts for user ${req.user._id}`
          );

          // First try to find a cart with items
          cart = userCarts.find((c) => c.items && c.items.length > 0);

          // If no cart with items, use the newest one
          if (!cart) {
            userCarts.sort((a, b) => b.createdAt - a.createdAt);
            cart = userCarts[0];
          }

          // Populate the selected cart
          cart = await Cart.findById(cart._id).populate({
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
        }
      }

      // If still no cart and we need one, check for session cart or create new
      if (!cart && needsCart) {
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
          console.log(`Created new user cart: ${cart._id}`);
        }
      }
    } else {
      // Handle guest users with session - find the cart for this session
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

      if (!cart && needsCart) {
        // Create a new cart for this session only if we need one
        // (don't create for order endpoints that don't need a new cart)
        cart = new Cart({ sessionId });
        await cart.save();
        console.log(`Created new cart for session ${sessionId}`);
      } else if (cart) {
        console.log(`Found existing cart for session ${sessionId}`);
      }
    } // Store cart in the request for controllers to use
    req.cart = cart; // Debug log cart status

    if (req.cart) {
      console.log(
        `Cart status: ${req.cart._id}, Items: ${req.cart.items.length}`
      );

      // Always store the cart ID in the session to ensure consistency
      req.session.cartId = req.cart._id.toString();

      // Double-check that we're using the correct cart for checkout
      if (req.originalUrl === "/api/orders" && req.method === "POST") {
        // If cart is empty for a checkout request, return an error
        if (!req.cart.items || req.cart.items.length === 0) {
          console.error("Attempted checkout with empty cart");
          return res.status(400).json({
            success: false,
            message:
              "Your cart is empty. Please add items before checking out.",
          });
        }

        // Log the checkout cart ID for debugging
        console.log(
          `Using cart ${req.cart._id} for checkout with ${req.cart.items.length} items`
        );
      }
    } else {
      console.log("No cart exists for the current session");
      // Don't store a cart ID in the session if there's no cart
      delete req.session.cartId;
    }

    // Save the session to ensure cart ID is persisted
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
      next();
    });
  } catch (error) {
    console.error("Cart middleware error:", error);
    next(error);
  }
};
