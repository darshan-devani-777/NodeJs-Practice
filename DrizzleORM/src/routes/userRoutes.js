const express = require("express");
const {
  verifyToken,
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserStats,
  updateUser,
  getUserCount,
  batchCreateUsers,
  registerUserWithPost,
  getUserPosts,
  getPostsGroupedByUser,
  getUsersGroupedByDate,
} = require("../../src/controllers/userController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/register-with-post", registerUserWithPost);

router.post("/batch", verifyToken, batchCreateUsers);

router.post("/login", loginUser);

router.get("/", verifyToken, getAllUsers);

router.get("/count", verifyToken, getUserCount);

router.get("/stats", verifyToken, getUserStats);

router.get("/grouped-by-date", verifyToken, getUsersGroupedByDate);

router.get("/:id", verifyToken, getUserById);

router.get("/:id/posts", verifyToken, getUserPosts);

router.put("/:id", verifyToken, updateUser);

router.delete("/:id", verifyToken, deleteUser);

router.get("/posts/grouped-by-user", verifyToken, getPostsGroupedByUser);

module.exports = router;
