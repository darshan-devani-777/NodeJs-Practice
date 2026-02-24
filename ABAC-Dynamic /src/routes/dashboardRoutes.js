const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const traceMiddleware = require("../middleware/trace");
const abac = require("../middleware/abac");

const { getDashboard } = require("../controllers/dashboardController");

// VIEW DASHBOARD
router.get( "/view-dashboard", traceMiddleware, authMiddleware, abac("view", "Dashboard"), getDashboard);

module.exports = router;