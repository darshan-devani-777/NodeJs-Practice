const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.post("/register-user", authController.registerUser);
router.post("/login-user", authController.loginUser);
router.post("/forgotpassword", authController.forgotPassword);
router.post("/resetpassword/:token", authController.resetPassword);
router.get(
  "/all-users",
  protect,
  authorizeRoles("admin"),
  authController.getAllUsers
);
router.put(
  "/update-profile",
  protect,
  authorizeRoles("user", "admin"),
  authController.updateProfile
);
router.put(
  "/toggle-status",
  protect,
  authorizeRoles("admin"),
  authController.toggleUserStatus
);
router.put(
  "/bulk-activate",
  protect,
  authorizeRoles("admin"),
  authController.bulkActivateUsers
);
router.put(
  "/bulk-deactivate",
  protect,
  authorizeRoles("admin"),
  authController.bulkDeactivateUsers
);
router.put(
  "/bulk-delete",
  protect,
  authorizeRoles("admin"),
  authController.bulkDeleteUsers
);
router.post(
  "/bulk-create",
  protect,
  authorizeRoles("admin"),
  authController.bulkCreateUsers
);
router.get(
  "/all-activity-logs",
  protect,
  authorizeRoles("admin"),
  authController.getAllActivityLogs
);

module.exports = router;
