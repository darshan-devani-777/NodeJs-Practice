const express = require("express");
require("dotenv").config();
const emailController = require("../controllers/email_subs_controller");
var { verifyToken } = require("../middlewares/verifyToken");

var router = express.Router();

router.route("/listEmailSubsTopics").get(verifyToken, emailController.listEmailTopics);

module.exports = router;