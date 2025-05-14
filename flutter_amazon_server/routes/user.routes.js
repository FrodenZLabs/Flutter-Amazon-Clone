import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/get_guarantors", verifyToken, getAllUsers);
router.get("/get_guarantor/:id", verifyToken, getUserById);
router.post("/new_guarantor", verifyToken, createUser);
router.put("/update_user/:id", verifyToken, updateUser);
router.delete("/delete_user/:id", verifyToken, deleteUser);

export default router;
