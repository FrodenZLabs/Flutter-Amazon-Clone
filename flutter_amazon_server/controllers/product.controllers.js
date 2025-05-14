import mongoose from "mongoose";
import Product from "../models/product.models.js";
import { errorHandler } from "../utils/errorHandler.js";
import cloudinary from "../utils/cloudinary.js";

export const addProduct = async (request, response, next) => {
  try {
    const { name, description, category, price, stock } = request.body;

    if (request.user.role !== "admin") {
      return next(errorHandler(403, "You are not allowed to create a product"));
    }

    // Ensure images were uploaded
    if (!request.images || request.images.length === 0) {
      return response.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      price,
      stock,
      images: request.images,
    });

    const savedProduct = await newProduct.save();
    response.status(201).json({
      success: true,
      savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Failed to add product", error));
  }
};

export const updateProduct = async (request, response, next) => {
  try {
    const productId = request.params.id;
    const { name, description, category, price, stock } = request.body;

    // Ensure only admins can update products
    if (request.user.role !== "admin") {
      return next(errorHandler(403, "You are not allowed to update a product"));
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(errorHandler(400, "Invalid product ID"));
    }

    // Find the existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return next(errorHandler(404, "Product not found"));
    }

    const productUpdateFields = {};
    if (name) productUpdateFields.name = name;
    if (description) productUpdateFields.description = description;
    if (category) productUpdateFields.category = category;
    if (price) productUpdateFields.price = price;
    if (stock) productUpdateFields.stock = stock;
    if (request.files && request.files.length > 0) {
      productUpdateFields.images = request.images; // Cloudinary image URLs
    } else {
      productUpdateFields.images = existingProduct.images; // Keep existing images
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: productUpdateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return next(errorHandler(404, "Product not found"));
    }

    response.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Failed to update product", error));
  }
};

// Delete a product
export const deleteProduct = async (request, response, next) => {
  try {
    const productId = request.params.id;

    if (request.user.role !== "admin") {
      return next(errorHandler(403, "You are not allowed to delete a product"));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(errorHandler(404, "Product not found"));
    }

    // Delete each image from Cloudinary and local storage
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extract public ID from Cloudinary URL
          const publicId = imageUrl.split("/").pop().split(".")[0];

          // Delete from Cloudinary
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Error deleting from Cloudinary: ${error.message}`);
        }
      }
    }

    await Product.findByIdAndDelete(productId);
    response.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(errorHandler(500, "Failed to delete product", error));
  }
};

// Get all products for customers
export const getAllProducts = async (request, response, next) => {
  try {
    const { searchTerm, inStock, outOfStock, productTypes, sort, limit } =
      request.query;

    let filter = {};

    // Search by product name (case-insensitive)
    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: "i" };
    }

    // Filter by stock availability
    if (inStock === "true" && outOfStock !== "true") {
      filter.stock = { $gt: 0 }; // Products in stock
    } else if (outOfStock === "true" && inStock !== "true") {
      filter.stock = { $lte: 0 }; // Products out of stock
    }

    // Filter by category (previously product type)
    if (productTypes) {
      const typesArray = productTypes.split(",");
      filter.category = { $in: typesArray };
    }

    // Sorting logic
    let sortOption = {};
    if (sort === "price_desc") {
      sortOption.price = -1; // Highest to lowest price
    } else if (sort === "price_asc") {
      sortOption.price = 1; // Lowest to highest price
    } else if (sort === "createdAt_desc") {
      sortOption.createdAt = -1; // Newest first
    } else if (sort === "createdAt_asc") {
      sortOption.createdAt = 1; // Oldest first
    }

    // Convert limit to a number and set default (no limit if not provided)
    const productLimit = limit ? parseInt(limit, 10) : undefined;

    // Fetch products with optional limit
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(productLimit);

    response.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to get all products", error));
  }
};

// Get all products for customers
export const getProductByID = async (request, response, next) => {
  try {
    const productId = request.params.id;
    const products = await Product.findById(productId);
    if (!products) {
      return next(errorHandler(404, "Product not found"));
    }
    response.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to get product", error));
  }
};
