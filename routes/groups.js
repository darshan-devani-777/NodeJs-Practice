const express = require("express");
require("dotenv").config();

var router = express.Router();

const groupsController = require("../controllers/groups_controller");
var { verifyToken } = require("../middlewares/verifyToken");
var { upload } = require("../middlewares/multer");
require("dotenv").config();

// Must be defined before parameterized routes
router.route("/my/created").get(verifyToken, groupsController.getMyCreatedGroups);
router.route("/my/joined").get(verifyToken, groupsController.getMyJoinedGroups);
router.route("/my").get(verifyToken, groupsController.getMyGroups);

router.route("/").get(verifyToken, groupsController.getGroups);
router.route("/create").post(verifyToken, upload.single('image'), groupsController.createGroup);
router.route("/owner").post(verifyToken, groupsController.updateGroupOwners);
router.route("/addMember").post(verifyToken, groupsController.addGroupMember);
router.route("/removeMember").post(verifyToken, groupsController.removeGroupMember);
router.route("/report").post(verifyToken, groupsController.reportGroup);
router.route("/:group_id/exit").post(verifyToken, groupsController.exitGroup);
router.route("/:group_id").get(verifyToken, groupsController.getGroupDetails);
router.route("/:group_id").put(verifyToken, upload.single('image'), groupsController.updateGroup);
router.route("/:group_id").delete(verifyToken, groupsController.deleteGroup);
router.route("/:group_id/members").get(verifyToken, groupsController.getGroupMembers);
router.route("/:group_id/posts").get(verifyToken, groupsController.getGroupPosts);

module.exports = router