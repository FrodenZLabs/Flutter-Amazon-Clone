import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MONGODB is connected."))
  .catch((error) => console.log(error));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Server Port
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Middleware
app.use((error, request, response, next) => {
  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || "Internal Server Error";
  response.status(statusCode).json({
    success: false,
    statusCode,
    errorMessage,
  });
});
