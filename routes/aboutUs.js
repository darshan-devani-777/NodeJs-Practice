const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/multer");
const { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
const aboutUsController = require("../controllers/aboutUs_controller");

router.post("/create", verifyToken, upload.single("hero_image"), aboutUsController.createAboutUs);
router.put("/update/:id", verifyToken, upload.single("hero_image"), aboutUsController.updateAboutUs);
router.delete("/delete/:id", verifyToken, aboutUsController.deleteAboutUs);
router.get("/fetch", aboutUsController.getAllAboutUs);
router.get("/fetch/:id", aboutUsController.getAboutUsById);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render("aboutus", {
      currentPage: "about-Us",
      currentSubPage: "",
    });
  });  

module.exports = router;
