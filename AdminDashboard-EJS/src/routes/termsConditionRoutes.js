const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const termsConditionController = require("../controllers/termsConditionController");

// UPSERT TERMS AND CONDITIONS
router.post(
  "/upsert",
  protect,
  authorizeRoles("admin"),
  termsConditionController.upsertTerms
);

// VIEW TERMS AND CONDITIONS
router.get(
  "/view",
  protect,
  authorizeRoles("user", "admin"),
  termsConditionController.getTerms
);

module.exports = router;