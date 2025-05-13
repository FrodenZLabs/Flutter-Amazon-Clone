import Order from "../models/order.models.js";
import { errorHandler } from "../utils/errorHandler.js";

// Get all orders
export const getAllOrders = async (request, response, next) => {
  try {
    const orders = await Order.find()
      .populate("authId")
      .populate("items.productId");
    response.status(200).json({
      success: true,
      message: "Successfully fetched all orders.",
      orders,
    });
  } catch (error) {
    next(errorHandler(500, "Error fetching orders"));
  }
};

// Get order by ID
export const getOrderById = async (request, response, next) => {
  try {
    const orderId = request.params.id;

    // Fetch the order by ID and populate related fields
    const order = await Order.findById(orderId)
      .populate("authId") // Populate user details
      .populate("items.productId"); // Populate product details

    if (!order) return next(errorHandler(404, "Order not found"));

    response.status(200).json({ success: true, order });
  } catch (error) {
    next(errorHandler(500, "Error fetching order"));
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (request, response, next) => {
  try {
    const authId = request.params.authId;

    // Fetch all orders for the given user ID
    const orders = await Order.find({ authId })
      .populate("authId") // Populate user details
      .populate("items.productId"); // Populate product details in the order items

    if (!orders || orders.length === 0) {
      return next(errorHandler(404, "No orders found for this user"));
    }

    // Return the list of orders
    response.status(200).json({
      success: true,
      count: orders.length, // Include the count of orders
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(errorHandler(500, "Error fetching orders"));
  }
};

// Update order status
export const updateOrderStatus = async (request, response, next) => {
  try {
    const { status } = request.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) return next(errorHandler(404, "Order not found"));
    response.json(updatedOrder);
  } catch (error) {
    next(errorHandler(500, "Error updating order status"));
  }
};

// Delete an order
export const deleteOrder = async (request, response, next) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(request.params.id);
    if (!deletedOrder) return next(errorHandler(404, "Order not found"));
    response.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Error deleting order"));
  }
};
