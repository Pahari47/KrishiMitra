import { Router } from "express";
import { createOrUpdateUser, getUser, getAllUsers, deleteUser } from "../Controllers/userController";

const router = Router();

router.post("/createorupdate", createOrUpdateUser); // Create or update user
router.get("/", getAllUsers); // Get all users
router.get("/:email", getUser); // Get user by email
router.delete("/:email", deleteUser); // Delete user by email

export default router;
