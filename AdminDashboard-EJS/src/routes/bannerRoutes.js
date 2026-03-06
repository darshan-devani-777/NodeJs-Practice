const express = require("express");
const router = express.Router();

const bannerController = require("../controllers/bannerController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const upload = require("../middlewares/cloudinaryUpload");

router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  upload("banner").single("image"),
  bannerController.createBanner
);

router.get(
  "/all-banners",
  protect,
  authorizeRoles("admin", "user"),
  bannerController.getAllBanners
);

router.get(
  "/:bannerId",
  protect,
  authorizeRoles("admin", "user"),
  bannerController.getBannerById
);

router.put(
  "/update/:bannerId",
  protect,
  authorizeRoles("admin"),
  upload("banner").single("image"),
  bannerController.updateBanner
);

router.put(
  "/toggle-status/:bannerId",
  protect,
  authorizeRoles("admin"),
  bannerController.toggleBannerStatus
);

router.delete(
  "/delete/:bannerId",
  protect,
  authorizeRoles("admin"),
  bannerController.deleteBanner
);

module.exports = router;