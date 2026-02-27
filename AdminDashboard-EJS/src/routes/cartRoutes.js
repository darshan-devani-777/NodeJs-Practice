const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// ADD TO CART
router.post("/add", protect, authorizeRoles("user", "admin"), cartController.addToCart);

// GET CART STATS
router.get("/stats", protect, authorizeRoles("admin"), cartController.getCartStats);

// GET ALL CARTS
router.get("/all-carts", protect, authorizeRoles("user", "admin"), cartController.getCart);

// GET SPECIFIC CART 
router.get("/specific/:cartId", protect, authorizeRoles("admin"), cartController.getSpecificCart);

// UPDATE CART
router.put("/update", protect, authorizeRoles("user", "admin"), cartController.updateCartItem);

// REMOVE CART
router.delete("/remove/:productId", protect, authorizeRoles("user", "admin"), cartController.removeFromCart);

// CLEAR CART
router.delete("/clear", protect, authorizeRoles("user", "admin"), cartController.clearCart);

module.exports = router;