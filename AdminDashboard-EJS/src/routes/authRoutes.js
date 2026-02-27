const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// REGISTER USER
router.post("/register-user", authController.registerUser);

// LOGIN USER
router.post("/login-user", authController.loginUser);

// FORGOT PASSWORD
router.post("/forgotpassword", authController.forgotPassword);

// RESET PASSWORD
router.post("/resetpassword/:token", authController.resetPassword);

// GET ALL USERS
router.get(
  "/all-users",
  protect,
  authorizeRoles("admin", "manager"),
  authController.getAllUsers
);

// UPDATE PROFILE
router.put(
  "/update-profile",
  protect,
  authorizeRoles("admin", "manager", "editor", "support", "user"),
  authController.updateProfile
);

// CHANGE PASSWORD
router.put(
  "/change-password",
  protect,
  authorizeRoles("admin", "manager", "editor", "support", "user"),
  authController.changePassword
);

// TOGGLE STATUS
router.put(
  "/toggle-status",
  protect,
  authorizeRoles("admin"),
  authController.toggleUserStatus
);

// BULK ACTIVATE
router.put(
  "/bulk-activate",
  protect,
  authorizeRoles("admin"),
  authController.bulkActivateUsers
);

// BULK DEACTIVATE
router.put(
  "/bulk-deactivate",
  protect,
  authorizeRoles("admin"),
  authController.bulkDeactivateUsers
);

// BULK DELETE
router.put(
  "/bulk-delete",
  protect,
  authorizeRoles("admin"),
  authController.bulkDeleteUsers
);

// BULK CREATE
router.post(
  "/bulk-create",
  protect,
  authorizeRoles("admin"),
  authController.bulkCreateUsers
);

// GET ALL ACTIVITY LOGS
router.get(
  "/all-activity-logs",
  protect,
  authorizeRoles("admin", "manager"),
  authController.getAllActivityLogs
);

// VERIFY EMAIL
router.get(
  "/verify-email/:token",
  authController.verifyEmail
);

module.exports = router;
