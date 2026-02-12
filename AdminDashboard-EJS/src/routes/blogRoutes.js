const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  blogController.createBlog
);

router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  blogController.getBlogStats
);

router.get(
  "/all-blogs",
  protect,
  authorizeRoles("user", "admin"),
  blogController.getAllBlogs
);

router.get(
  "/:blogId",
  protect,
  authorizeRoles("admin"),
  blogController.getBlogById
);

router.put(
  "/update/:blogId",
  protect,
  authorizeRoles("admin"),
  blogController.updateBlog
);

router.delete(
  "/delete/:blogId",
  protect,
  authorizeRoles("admin"),
  blogController.deleteBlog
);

router.put(
  "/bulk-publish",
  protect,
  authorizeRoles("admin"),
  blogController.bulkTogglePublishBlogs
);

module.exports = router;
