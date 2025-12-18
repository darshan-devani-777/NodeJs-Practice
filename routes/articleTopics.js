const {
  createArticleTopic,
  updateArticleTopic,
  deleteArticleTopic,
  getArticleTopics,
  getArticleTopicsByTag,
} = require("../controllers/articles_topic_controller");
const { upload } = require("../middlewares/multer");

const express = require("express");
const router = express.Router();

router.post("/", createArticleTopic);
router.put("/:id", updateArticleTopic);
router.delete("/:id", deleteArticleTopic);
router.get("/", getArticleTopics);
router.get("/:tagId", getArticleTopicsByTag);

module.exports = router;
