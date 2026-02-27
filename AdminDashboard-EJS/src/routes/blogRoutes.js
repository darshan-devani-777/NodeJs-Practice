const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/cloudinaryUpload");

// CREATE BLOG
router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  blogController.createBlog
);

// GET BLOG STATS
router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  blogController.getBlogStats
);

// GET ALL BLOGS
router.get(
  "/all-blogs",
  protect,
  authorizeRoles("user", "admin"),
  blogController.getAllBlogs
);

// GET SPECIFIC BLOGS
router.get(
  "/:blogId",
  protect,
  authorizeRoles("admin"),
  blogController.getBlogById
);

// UPDATE BLOG
router.put(
  "/update/:blogId",
  protect,
  authorizeRoles("admin"),
  blogController.updateBlog
);

// DELETE BLOG
router.delete(
  "/delete/:blogId",
  protect,
  authorizeRoles("admin"),
  blogController.deleteBlog
);

// BULK PUBLISH BLOG
router.put(
  "/bulk-publish",
  protect,
  authorizeRoles("admin"),
  blogController.bulkTogglePublishBlogs
);

// UPDATE BLOG IMAGE
router.post(
  "/upload-image",
  protect, 
  authorizeRoles("admin"), 
  upload("blog").single("upload"), 
  blogController.uploadBlogImage 
);

module.exports = router;
