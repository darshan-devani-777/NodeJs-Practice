const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const rbacMiddleware = require("../middleware/rbac");
const traceMiddleware = require("../middleware/trace");
const { getDashboard } = require("../controllers/dashboardController");

// VIEW DASHBOARD
router.get( "/view-dashboard", traceMiddleware, authMiddleware, rbacMiddleware("DASHBOARD:VIEW"), getDashboard);

module.exports = router;