const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const aboutUsController = require("../controllers/aboutUsController");

// UPSERT ABOUT US
router.post(
  "/upsert",
  protect,
  authorizeRoles("admin"),
  aboutUsController.upsertAbout
);

// VIEW ABOUT US
router.get(
  "/view",
  protect,
  authorizeRoles("user", "admin"),
  aboutUsController.getAbout
);

module.exports = router;