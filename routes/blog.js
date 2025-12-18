const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog_controller");
const { upload } = require("../middlewares/multer");
var {verifyToken, verifyTokenAdmin} = require("../middlewares/verifyToken");

// Admin view route
router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
  res.render("blogs", {
    currentPage: "blogs",
    currentSubPage: "",
  });
});

// Blog detail page route
router.route("/detail/:blog_id").get(async (req, res, next) => {
  try {
    const { blog_id } = req.params;
    
    // Create a mock request object for the controller
    const mockReq = {
      params: { blog_id },
      user: { is_admin: false } // Default to non-admin for public view
    };
    
    // Create a mock response object to capture the data
    let responseData = null;
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };
    
    // Call the controller
    await blogController.getBlogById(mockReq, mockRes);
    
    // Check if blog was found
    if (mockRes.statusCode === 404 || !responseData || !responseData.success) {
      return res.status(404).render("error", { message: "Blog not found" });
    }
    
    // Extract the blog data
    const blog = responseData.data[0];
    
    res.render("blog-detail", {
      blog: blog,
      currentPage: "blogs",
      currentSubPage: "detail"
    });
  } catch (error) {
    console.error("Error rendering blog detail:", error);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

router.post("/create",upload.single("file"),verifyToken, blogController.createBlog);
router.get("/getById/:blog_id", verifyToken, blogController.getBlogById);
router.get("/getAllBlogs", verifyToken, blogController.getAllBlogs);
router.put("/update/:blog_id",upload.single("file"),verifyToken, blogController.updateBlog);
router.delete("/delete/:blog_id",verifyToken, blogController.deleteBlog);

module.exports = router;