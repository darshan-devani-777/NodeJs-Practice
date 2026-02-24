const router = require("express").Router();
const trace = require("../middleware/trace");
const auth = require("../middleware/auth");
const abac = require("../middleware/abac");

const { createUser,assignRole,reviewRequest } = require("../controllers/adminController");

// CREATE USER
router.post("/create-user",trace,auth, abac("create", "User"),createUser);

// ASSIGN ROLE
router.post("/assign-role/:userId",trace,auth, abac("assignRole", "User"),assignRole);

// REVIEW REQUEST
router.post("/review-request/:requestId",trace,auth, abac("review", "PermissionRequest"),reviewRequest);

module.exports = router;