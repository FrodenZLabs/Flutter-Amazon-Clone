import Cart from "../models/cart.models.js";
import Product from "../models/product.models.js";
import { errorHandler } from "../utils/errorHandler.js";

// Add to cart
export const addToCart = async (request, response, next) => {
  try {
    const { productId, quantity } = request.body; // Default repayment plan is 3 months
    const authId = request.user.id; // Extract user ID from the token

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(errorHandler(404, "Product not found"));
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ authId });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({
        authId,
        items: [
          {
            productId,
            quantity,
          },
        ],
      });
    } else {
      // Check if the product is already in the cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex !== -1) {
        // Update the quantity and repayment plan if the product already exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add the product as a new item if it doesn't exist
        cart.items.push({
          productId,
          quantity,
        });
      }
    }

    // Save the updated cart
    await cart.save();

    response.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    next(errorHandler(500, "Error adding to cart"));
  }
};

// Get cart by user ID
export const getCartByUserId = async (request, response, next) => {
  try {
    const authId = request.params.authId;

    const cart = await Cart.findOne({ authId }).populate("items.productId");
    if (!cart) return next(errorHandler(404, "Cart not found"));

    // Calculate the total number of items in the cart
    const totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    response.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
      totalItems,
    });
  } catch (error) {
    next(errorHandler(500, "Error fetching cart"));
  }
};

// Get cart item by product ID
export const getCartByProductId = async (request, response, next) => {
  try {
    const productId = request.params.productId; // Extract product ID from request params
    const authId = request.user.id; // Extract user ID from the token

    // Find the cart for the authenticated user
    const cart = await Cart.findOne({ authId }).populate("items.productId");
    if (!cart) return next(errorHandler(404, "Cart not found"));

    // Find the specific cart item with the matching product ID
    const cartItem = cart.items.find(
      (item) => item.productId._id.toString() === productId
    );

    if (!cartItem) {
      return next(errorHandler(404, "Product not found in cart"));
    }

    // Return the matching cart item
    response.status(200).json({
      success: true,
      message: "Cart item fetched successfully",
      cartItem,
    });
  } catch (error) {
    next(errorHandler(500, "Error fetching cart item"));
  }
};

// Update cart item quantity and repayment plan
export const updateCartItem = async (request, response, next) => {
  try {
    const { productId, quantity } = request.body;
    const authId = request.user.id; // Extract user ID from the token

    // Find the user's cart
    const cart = await Cart.findOne({ authId });

    if (!cart) return next(errorHandler(404, "Cart not found"));

    // Find the index of the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Update both quantity and repayment plan
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      response.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cart,
      });
    } else {
      next(errorHandler(404, "Item not found in cart"));
    }
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error updating cart item"));
  }
};

// Remove item from cart
export const removeItemFromCart = async (request, response, next) => {
  try {
    const { productId } = request.body;
    const authId = request.user.id;

    // Validate productId
    if (!productId) {
      return next(errorHandler(400, "Product ID is required"));
    }

    // Find the user's cart
    const cart = await Cart.findOne({ authId });

    if (!cart) {
      return next(errorHandler(404, "Cart not found"));
    }

    // Filter out the item to be removed
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Check if the item was removed
    if (cart.items.length === initialItemCount) {
      return response.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Save the updated cart
    await cart.save();

    response.status(200).json({
      success: true,
      message: "Removed cart item successfully",
      cart,
    });
  } catch (error) {
    next(errorHandler(500, "Error removing item from cart"));
  }
};

// Clear cart
export const clearCart = async (request, response, next) => {
  try {
    const authId = request.params.authId;
    // Find the cart and update the items array to an empty array
    const cart = await Cart.findOneAndUpdate(
      { authId }, // Match the cart by authId
      { $set: { items: [] } }, // Set the items array to empty
      { new: true } // Return the updated cart document
    );
    if (!cart) return next(errorHandler(404, "Cart not found"));

    response
      .status(200)
      .json({ success: true, message: "Cart deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error clearing cart"));
  }
};
