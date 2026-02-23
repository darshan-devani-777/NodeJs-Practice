const router = require("express").Router();
const trace = require("../middleware/trace");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const { createUser,assignRole,reviewRequest } = require("../controllers/adminController");

// CREATE USER
router.post("/create-user",trace,auth,rbac("USERS:CREATE"),createUser);

// ASSIGN ROLE
router.post("/assign-role/:userId",trace,auth,rbac("USERS:ASSIGN_ROLE"),assignRole);

// REVIEW REQUEST
router.post("/review-request/:requestId",trace,auth,rbac("REVIEW_PERMISSION"),reviewRequest);

module.exports = router;