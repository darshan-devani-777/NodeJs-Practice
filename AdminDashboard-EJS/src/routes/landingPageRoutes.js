const express = require("express");
const router = express.Router();

const landingPageController = require("../controllers/landingPageController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// CREATE / UPDATE SECTION 
router.post(
  "/upsert-section",
  protect,
  authorizeRoles("admin"),
  landingPageController.upsertSection
);

// GET ALL SECTIONS 
router.get(
  "/all-sections",
  protect,
  authorizeRoles("admin", "user"),
  landingPageController.getSections
);

// GET SECTION BY ID
router.get(
  "/:sectionId",
  protect,
  authorizeRoles("admin", "user"),
  landingPageController.getSectionById
);

// TOGGLE SECTION
router.patch(
"/toggle-section/:sectionId", 
protect,
authorizeRoles("admin"),
landingPageController.toggleSectionStatus
);

// DELETE SECTION
router.delete(
  "/delete-section/:sectionId",
  protect,
  authorizeRoles("admin"),
  landingPageController.deleteSection
);

module.exports = router;