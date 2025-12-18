const express = require("express");
require("dotenv").config();

var router = express.Router();

const bookmarkController = require("../controllers/bookmark_controller");
var { verifyToken } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/toggle-bookmark").post(verifyToken, bookmarkController.toggleBookmark);
router.route("/get-bookmarks").get(verifyToken, bookmarkController.listBookmarks);

module.exports = router;
