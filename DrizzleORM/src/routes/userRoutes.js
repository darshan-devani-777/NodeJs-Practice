const express = require("express");
const {
  verifyToken,
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserStats,
} = require("../../src/controllers/userController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/", verifyToken, getAllUsers);

router.get("/:id", verifyToken, getUserById);

router.delete("/:id", verifyToken, deleteUser);

router.get("/stats", verifyToken, getUserStats);

module.exports = router;
