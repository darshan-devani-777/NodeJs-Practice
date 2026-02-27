const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const privacyPolicyController = require("../controllers/privacyPolicyController");

// ADMIN ROUTES
router.post("/upsert", protect, authorizeRoles("admin"), privacyPolicyController.upsertPolicy);
router.get("/view", protect, authorizeRoles("user","admin"), privacyPolicyController.getPolicy);

module.exports = router;
