const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
const privacyPolicyController = require("../controllers/privacyPolicy_controller");

router.get("/fetch", privacyPolicyController.getAllPrivacyPolicies);
router.get("/fetch/:id", privacyPolicyController.getPrivacyPolicyById);
router.post(
  "/create",
  verifyToken,
  privacyPolicyController.createPrivacyPolicy
);
router.put(
  "/update/:id",
  verifyToken,
  privacyPolicyController.updatePrivacyPolicy
);
router.delete(
  "/delete/:id",
  verifyToken,
  privacyPolicyController.deletePrivacyPolicy
);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
  res.render("privacyPolicy", {
    currentPage: "privacy-policy",
    currentSubPage: "",
  });
});

module.exports = router;
