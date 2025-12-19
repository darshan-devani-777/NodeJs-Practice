const postModel = require("../models/postModel");
const userModel = require("../models/userModel");

async function createPost(req, res) {
  const { userId, title, content } = req.body;

  if (!userId || !title || !content) {
    return res
      .status(400)
      .json({ message: "UserId, title and content are required" });
  }

  try {
    const user = await userModel.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await postModel.create({ userId, title, content });
    res.status(201).json({
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create post" });
  }
}

async function getPostById(req, res) {
  const postId = parseInt(req.params.id, 10);

  if (!Number.isFinite(postId)) {
    return res.status(400).json({ message: "Invalid post id" });
  }

  try {
    const post = await postModel.findOne(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
}

module.exports = {
  createPost,
  getPostById,
};

