const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const contactController = require("../controllers/contact_controller");

router.post("/create-form", verifyToken, contactController.submitContactForm);
router.put("/update-form/:id", verifyToken, contactController.updateContactForm);
router.get("/fetch-forms", verifyToken, contactController.getAllContactForms);

router.post("/create-info", verifyToken, contactController.createOrUpdateContactInfo);
router.delete("/delete-info", verifyToken, contactController.deleteContactInfo);
router.get("/fetch-info", verifyToken,contactController.getContactInfo);

module.exports = router;
