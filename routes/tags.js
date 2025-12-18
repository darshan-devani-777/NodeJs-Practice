const express = require("express");
require("dotenv").config();
const { upload } = require("../middlewares/multer");
var router = express.Router();

const tagsController = require("../controllers/tags_controller");
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/list").post(verifyToken, tagsController.listTAGs);
router.route("/getAllTAGs").get(verifyToken, tagsController.getAllTAGs);
router.route("/getAllGroupTAGs").get(verifyToken, tagsController.getAllGroupTAGs);
router.route("/getTAGs").get(verifyToken, tagsController.getTAGs);
router.route("/create").post(verifyToken, tagsController.createTAG);
router.route("/createGroupTag").post(verifyToken, tagsController.createGroupTAG);
router.route("/edit/:tag_id").get(verifyToken, tagsController.getTAGByID).post(verifyToken, tagsController.updateTAG);
router.route("/delete/:tag_id").delete(verifyToken, tagsController.deleteTAG);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render('tags', {
        currentPage: 'tags', currentSubPage: ''
    })
});

module.exports = router;
