const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");
const { isAdminOrSuperAdmin, canManageUser } = require("../middlewares/rbacMiddleware");

// ADD TO CART 
router.post("/add", protect , canManageUser, cartController.addProductToCart);

// GET SPECIFIC CART
router.get("/:id", protect, canManageUser, cartController.getUserCart);

// UPDATE CART
router.put("/update", protect , canManageUser, cartController.updateProductQuantity);

// REMOVE CART
router.delete("/remove/:productId", protect , canManageUser, cartController.removeProductFromCart);

// GET ALL CARTS 
router.get("/all", protect , isAdminOrSuperAdmin, cartController.getAllCarts);

module.exports = router;
