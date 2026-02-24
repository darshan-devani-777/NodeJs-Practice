const express = require("express");
const router = express.Router();
const trace = require("../middleware/trace");
const auth = require("../middleware/auth");
const abac = require("../middleware/abac");
const { requestPermission } = require("../controllers/userController");

// REQUEST PERMISSION
router.post("/request-permission", trace, auth, abac("request", "PermissionRequest"), requestPermission);

module.exports = router;