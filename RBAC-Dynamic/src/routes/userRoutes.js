const express = require("express");
const router = express.Router();
const trace = require("../middleware/trace");
const auth = require("../middleware/auth");
const { requestPermission } = require("../controllers/userController");

// REQUEST PERMISSION
router.post("/request-permission", trace, auth, requestPermission);

module.exports = router;