import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addToCart,
  clearCart,
  getCartByProductId,
  getCartByUserId,
  removeItemFromCart,
  updateCartItem,
} from "../controllers/cart.controllers.js";

const router = express.Router();

// Add item to cart
router.post("/add", verifyToken, addToCart);

// Get cart by user ID
router.get("/:authId", verifyToken, getCartByUserId);
router.get("/product/:productId", verifyToken, getCartByProductId);

// Update cart item quantity
router.put("/update", verifyToken, updateCartItem);

// Remove item from cart
router.delete("/remove", verifyToken, removeItemFromCart);

// Clear cart
router.delete("/clear/:authId", verifyToken, clearCart);

export default router;
