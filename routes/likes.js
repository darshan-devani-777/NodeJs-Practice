const express = require("express");
require("dotenv").config();

var router = express.Router();

const likesController = require("../controllers/likes_contoller");
var { verifyToken } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/listLikes").post(likesController.listLikes);
router.route("/likeOrUnlike").post(verifyToken, likesController.likeOrUnlike);

module.exports = router;
