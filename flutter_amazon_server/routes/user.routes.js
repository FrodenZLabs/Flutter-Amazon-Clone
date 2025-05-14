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

router.get("/get_users", verifyToken, getAllUsers);
router.get("/get_user/:id", verifyToken, getUserById);
router.post("/create_user", verifyToken, createUser);
router.put("/update_user/:id", verifyToken, updateUser);
router.delete("/delete_user/:id", verifyToken, deleteUser);

export default router;
