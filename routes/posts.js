const express = require("express");
require("dotenv").config();
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");

var router = express.Router();

const postController = require("../controllers/posts_controller");
// const reportController = require('../controllers/report_controller');
var { verifyToken } = require("../middlewares/verifyToken");
require("dotenv").config();
const { upload } = require("../middlewares/multer");

router.get("/list", verifyToken, postController.listPosts);
router.get("/getPosts", verifyToken, postController.getUserPosts);
router.get("/getGroupPosts", verifyToken , postController.getGroupPosts);
router.get("/my/created", verifyToken, postController.getMyCreatedPosts);
router.get("/my/comments", verifyToken, postController.getMyComments);
router.route("/create").post(verifyToken, upload.single('image'), postController.createPost);
router.route("/edit/:post_id").post(verifyToken,upload.single('image'), postController.updatePost).get(verifyToken, postController.getPostDetail);
router
  .route("/getPostDetail/:post_id")
  .get(verifyToken, postController.getPostDetail);
router.route("/delete/:post_id").delete(verifyToken, postController.deletePost);
router.post("/report/:post_id", verifyToken, postController.reportPost);

module.exports = router;
