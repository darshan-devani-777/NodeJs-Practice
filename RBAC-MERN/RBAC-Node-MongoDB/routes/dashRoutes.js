const express = require("express");
const dashController = require("../controllers/dashController");
const { protect } = require("../middlewares/authMiddleware");
const { isAdminOrSuperAdmin } = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.get('/', protect , isAdminOrSuperAdmin , dashController.getDashboardData);

module.exports = router;
