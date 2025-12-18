const express = require("express");
require("dotenv").config();
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");

var router = express.Router();

const articlesController = require("../controllers/articles_controller");
var { verifyToken } = require("../middlewares/verifyToken");
require("dotenv").config();
const { upload } = require("../middlewares/multer");

router
  .get("/list", articlesController.listArticles)
  .get("/get/:article_id", articlesController.getArticle);
router.get("/getArticles", articlesController.getArticles);
router
  .route("/create")
  .post(verifyToken, upload.single("file"), articlesController.createArticle);
router
  .route("/edit/:article_id")
  .post(verifyToken, upload.single("file"), articlesController.updateArticle)
  .get(verifyToken, articlesController.getArticle);
router
  .route("/delete/:article_id")
  .delete(verifyToken, articlesController.deleteArticle);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
  res.render("articles", {
    currentPage: "articles",
    currentSubPage: "",
  });
});

module.exports = router;
