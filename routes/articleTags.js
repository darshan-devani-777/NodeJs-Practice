const {
  createArticleTag,
  updateArticleTag,
  deleteArticleTag,
  getArticleTags,
} = require("../controllers/articles_tag_controller");

const express = require("express");
const { upload } = require("../middlewares/multer");
const router = express.Router();

router.post("/", upload.single("image"), createArticleTag);
router.put("/:id", upload.single("image"), updateArticleTag);
router.delete("/:id", deleteArticleTag);
router.get("/", getArticleTags);

module.exports = router;
