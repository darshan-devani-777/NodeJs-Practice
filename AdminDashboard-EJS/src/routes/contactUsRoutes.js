const express = require('express');
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const contactUsController = require("../controllers/contactUsController");

// SUBMIT CONTACT FORM
router.post('/submit', protect, contactUsController.submitContact);

// VIEW CONTACT US MESSAGES
router.get('/view', protect, authorizeRoles('admin'), contactUsController.viewContactUs);

// MARK AS READ
router.patch('/read/:id', protect, authorizeRoles('admin'), contactUsController.markAsRead);

// DELETE CONTACT US MESSAGE
router.delete('/delete/:id', protect, authorizeRoles('admin'), contactUsController.deleteContact);

module.exports = router;
