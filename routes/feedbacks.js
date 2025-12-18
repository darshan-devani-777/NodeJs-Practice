const express = require("express");
require("dotenv").config();
const { upload } = require("../middlewares/multer");
var router = express.Router();

const feedbacksController = require("../controllers/feedbacks_controller");
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/list"). post(feedbacksController.listFeedbacks);
router.route("/getFeedbacks").get(verifyToken, feedbacksController.getAFeedbacks);
router.route("/create").post(verifyToken, upload.single("file"), feedbacksController.createFeedback);
router.route("/edit/:feedback_id").get(verifyToken, feedbacksController.getFeedbackByID).post(verifyToken, upload.single("file"), feedbacksController.updateFeedback);
router.route("/delete/:feedback_id").delete(verifyToken, feedbacksController.deleteFeedback);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render('feedbacks', {
        currentPage: 'feedbacks', currentSubPage: ''
    })
});

module.exports = router;
