const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");
const { isAdminOrSuperAdmin } = require("../middlewares/rbacMiddleware");
const upload = require("../middlewares/upload"); 

// (All roles: user/admin/superadmin)
router.get("/", protect, productController.getAllProducts);
router.get("/categories", protect, productController.getAllCategories);
router.get("/:id", protect, productController.getProductById);

// Middleware
const setProductUploadType = (req, res, next) => {
  req.uploadType = "products";
  next();
};

// Admin/Superadmin Only
// CREATE Product 
router.post(
  "/",
  protect,
  isAdminOrSuperAdmin,
  setProductUploadType,
  upload.single("image"), 
  productController.createProduct
);

// UPDATE Product
router.put(
  "/:id",
  protect,
  isAdminOrSuperAdmin,
  setProductUploadType,
  upload.single("image"), 
  productController.updateProduct
);
router.delete("/:id", protect, isAdminOrSuperAdmin, productController.deleteProduct);

module.exports = router;
