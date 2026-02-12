const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.post("/create", protect, authorizeRoles("admin"), faqController.createFaq);
router.put("/update/:faqId", protect, authorizeRoles("admin"), faqController.updateFaq);
router.delete("/delete/:faqId", protect, authorizeRoles("admin"), faqController.deleteFaq);
router.put("/bulk-toggle-status", protect, authorizeRoles("admin"), faqController.bulkToggleFaqStatus);

router.get("/stats", protect, authorizeRoles("admin"), faqController.getFaqStats);
router.get("/all-faqs", protect, authorizeRoles("user", "admin"), faqController.getAllFaqs);
router.get("/:faqId", protect, authorizeRoles("user", "admin"), faqController.getFaqById);

module.exports = router;
