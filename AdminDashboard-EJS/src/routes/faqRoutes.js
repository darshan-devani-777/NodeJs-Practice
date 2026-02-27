const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// BULK TOGGLE STATUS
router.put("/bulk-toggle-status", protect, authorizeRoles("admin"), faqController.bulkToggleFaqStatus);

// CREATE FAQ
router.post("/create", protect, authorizeRoles("admin"), faqController.createFaq);

// GET FAQ STATS
router.get("/stats", protect, authorizeRoles("admin"), faqController.getFaqStats);

// GET ALL FAQS
router.get("/all-faqs", protect, authorizeRoles("user", "admin"), faqController.getAllFaqs);

// GET SPECIFIC FAQS
router.get("/:faqId", protect, authorizeRoles("user", "admin"), faqController.getFaqById);

// UPDATE FAQS
router.put("/update/:faqId", protect, authorizeRoles("admin"), faqController.updateFaq);

// DELETE FAQS
router.delete("/delete/:faqId", protect, authorizeRoles("admin"), faqController.deleteFaq);

module.exports = router;
