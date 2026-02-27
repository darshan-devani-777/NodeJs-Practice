const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/cloudinaryUpload");
const bulkUpload = require("../middlewares/bulkUpload");

/* ================= STATIC ROUTES FIRST ================= */

// GET PRODUCT STATS
router.get(
  "/stats",
  protect,
  authorizeRoles("admin"),
  productController.getProductStats
);

// GET ALL PRODUCTS
router.get(
  "/all-products",
  protect,
  authorizeRoles("user", "admin"),
  productController.getAllProducts
);

// GET LOW STOCK PRODUCTS
router.get(
  "/low-stock",
  protect,
  authorizeRoles("admin"),
  productController.getLowStockProducts
);

// ADD PRODUCT
router.post(
  "/create",
  protect,
  authorizeRoles("admin"),
  upload("product").single("image"),
  productController.addProduct
);

// BULK UPLOAD USING CSV FILE
router.post(
  "/bulk-upload",
  protect,
  authorizeRoles("admin"),
  bulkUpload.single("file"),
  productController.bulkUploadProducts
);

// BULK EXPORT USING CSV FILE
router.get(
"/export-product", 
protect,
authorizeRoles("admin"), 
productController.exportProducts
);

// MANAGE INVENTORY
router.put(
  "/manage-inventory",
  protect,
  authorizeRoles("admin"),
  productController.manageInventory
);

/* ================= PARAM BASED ROUTES ================= */

// ADD REVIEW
router.post(
  "/reviews/add/:productId",
  protect,
  authorizeRoles("user", "admin"),
  productController.addReview
);

// UPDATE REVIEW
router.put(
  "/reviews/:reviewId",
  protect,
  authorizeRoles("user", "admin"),
  productController.updateReview
);

// DELETE REVIEW
router.delete(
  "/reviews/:reviewId",
  protect,
  authorizeRoles("user", "admin"),
  productController.deleteReview
);

// EDIT PRODUCT
router.put(
  "/update/:productId",
  protect,
  authorizeRoles("admin"),
  upload("product").single("image"),
  productController.editProduct
);

// APPROVE SELLER PRODUCT
router.put(
  "/toggle-approval/:productId",
  protect,
  authorizeRoles("admin"),
  productController.toggleProductApproval
);

// TOGGLE FEATURED PRODUCT
router.put(
  "/toggle-featured/:productId",
  protect,
  authorizeRoles("admin"),
  productController.toggleFeaturedProduct
);

// DELETE PRODUCT
router.delete(
  "/delete/:productId",
  protect,
  authorizeRoles("admin"),
  productController.deleteProduct
);

/* ================= ALWAYS KEEP LAST ================= */

// GET SPECIFIC PRODUCT
router.get(
  "/:productId",
  protect,
  authorizeRoles("user", "admin"),
  productController.getProductById
);

module.exports = router;