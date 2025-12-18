const express = require("express");
require("dotenv").config();

var router = express.Router();

const commentsController = require("../controllers/comments_controller");
var { verifyToken } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multer");
require("dotenv").config();

router.get("/list/:post_id", verifyToken, commentsController.listComment);
router.route("/create/:post_id").post([verifyToken, upload.single("image")], commentsController.createComment);
router.route("/edit/:comment_id").post(verifyToken, commentsController.editComment);
router.route("/delete/:comment_id").delete(verifyToken, commentsController.deleteComment);
router.post("/report/:comment_id", verifyToken, commentsController.reportComment);
router.get("/details/:comment_id",verifyToken, commentsController.getCommentDetails);

module.exports = router;
