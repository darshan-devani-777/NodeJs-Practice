const express = require("express");
require("dotenv").config();
const { upload } = require("../middlewares/multer");
var router = express.Router();

const faqsController = require("../controllers/faqs_controller");
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/list").post(faqsController.listFAQs);
router.route("/getFAQs").get(verifyToken, faqsController.getAFAQs);
router.route("/create").post(verifyToken, upload.none(), faqsController.createFAQ);
router.route("/edit/:faq_id").get(verifyToken, faqsController.getFAQByID).post(verifyToken, upload.none(), faqsController.updateFAQ);
router.route("/delete/:faq_id").delete(verifyToken, faqsController.deleteFAQ);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render('faqs', {
        currentPage: 'faqs', currentSubPage: ''
    })
});

module.exports = router;
