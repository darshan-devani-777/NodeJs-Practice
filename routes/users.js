var express = require("express");
var router = express.Router();
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
require("dotenv").config();
var userController = require("../controllers/users_controller");
const { upload } = require("../middlewares/multer");

router
  .route("/register")
  .post(upload.single("file"), userController.createUser);
router
  .route("/createUser")
  .post(upload.single("file"), verifyTokenAdmin, userController.createUser);
router.route("/resend-signup-otp").post(userController.resendSignupOtp);
router.route("/verify-signup-otp").post(userController.verifySignupOtp);
router.route("/login").post(userController.loginUser);
router.route("/refreshAccessToken").post(userController.refreshAccessToken);
router.route("/").get(verifyToken, userController.getUsers);
router
  .route("/changePassword")
  .post(verifyToken, userController.changePassword);
router
  .route("/profile")
  .post(upload.single("file"), verifyToken, userController.updateProfile);
router.route("/forgetPassword").post(userController.forgetPassword);
router.route("/verifyOtp").post(userController.verifyOtp);
router.route("/resetPassword").post(userController.resetPassword);
router
  .route("/updateStatus")
  .patch(verifyToken, userController.updateAccountStatus);
router.route("/delete").patch(verifyToken, userController.deleteAccount);
router.route("/authenticate").post(userController.authenticateUser);
router.route("/logout").get(verifyToken, userController.logOut);
router.route("/getProfile").get(verifyToken, userController.getUser);
router
  .route("/editUser/:user_id")
  .get(verifyToken, userController.getUser)
  .put(verifyToken, upload.single("file"), userController.updateProfile);
router
  .route("/deleteUser/:user_id")
  .delete(verifyToken, userController.deleteUser);

router.route("/admin/logout").get((req, res, next) => {
  res.clearCookie("accessToken");
  res.clearCookie("logged_in_user");
  res.clearCookie("user");
  res.clearCookie("refreshToken");
  // res.redirect('/users/admin/login')
  res.render("login");
});

router.route("/admin/dashboard").get(verifyTokenAdmin, (req, res, next) => {
  res.render("index", {
    currentPage: "index",
    currentSubPage: "",
  });
});

router.route("/admin/login").get((req, res, next) => {
  // if(req?.cookies?.logged_in_user && req?.cookies?.logged_in_user != "") {
  //     res.redirect('/users/admin/dashboard');
  // } else {
  res.render("login");
  // }
});

router.route("/admin/profile").get(verifyTokenAdmin, (req, res, next) => {
  res.render("profile", {
    currentPage: "index",
    currentSubPage: "",
    logged_in_user: req.body.logged_in_user,
  });
});

router.route("/admin/change-password").get(verifyTokenAdmin, (req, res, next) => {
  res.render("change-password", {
    currentPage: "index",
    currentSubPage: "",
    logged_in_user: req.body.logged_in_user,
  });
});

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
  res.render("users", {
    currentPage: "users",
    currentSubPage: "",
  });
});

module.exports = router;
