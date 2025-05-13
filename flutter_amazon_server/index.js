import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MONGODB is connected."))
  .catch((error) => console.log(error));

const app = express();
app.use(express.json());
app.use(cookieParser());

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
