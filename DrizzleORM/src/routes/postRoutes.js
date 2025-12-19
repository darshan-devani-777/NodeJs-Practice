const express = require("express");
const { verifyToken } = require("../controllers/userController");
const { createPost, getPostById } = require("../controllers/postController");

const router = express.Router();

router.post("/", verifyToken, createPost);

router.get("/:id", verifyToken, getPostById);

module.exports = router;

