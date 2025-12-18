const express = require("express");
require("dotenv").config();

var router = express.Router();

const communityController = require("../controllers/community_controller");
var { verifyToken } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multer");
require("dotenv").config();

router.route("/list").get(verifyToken, communityController.listCommunity);
router.route("/create").post([verifyToken, upload.single("image")], communityController.createCommunityPost);
router.route("/edit/:community_id").post(verifyToken, communityController.updateCommunityPost);
router.route("/get").get(verifyToken, communityController.getUserCommunity);
router.route("/get/:community_id").get(verifyToken, communityController.getCommunityPostDetail);
router.route("/delete/:community_id").delete(verifyToken, communityController.deleteCommunityPost);

module.exports = router;
