import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductByID,
  updateProduct,
} from "../controllers/product.controllers.js";
import upload from "../utils/multer.js";
import { uploadMultiple } from "../utils/uploadImage.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductByID);
router.post(
  "/add_product",
  verifyToken,
  upload.array("images", 6),
  uploadMultiple,
  addProduct
);
router.put(
  "/update_product/:id",
  verifyToken,
  upload.array("images", 6),
  uploadMultiple,
  updateProduct
);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
