const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
const termsOfUseController = require("../controllers/termsOfUse_controller");

router.get("/fetch", termsOfUseController.getAllTermsOfUse);
router.get("/fetch/:id", termsOfUseController.getTermsOfUseById);
router.post("/create", verifyToken, termsOfUseController.createTermsOfUse);
router.put("/update/:id", verifyToken, termsOfUseController.updateTermsOfUse);
router.delete("/delete/:id", verifyToken, termsOfUseController.deleteTermsOfUse);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render("termsOfUse", {
      currentPage: "terms-of-use",
      currentSubPage: "",
    });
  });

module.exports = router;
