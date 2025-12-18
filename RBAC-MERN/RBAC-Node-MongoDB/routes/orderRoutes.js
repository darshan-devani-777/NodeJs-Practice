const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");
const {
  isAdminOrSuperAdmin,
  canManageUser,
} = require("../middlewares/rbacMiddleware");

// CREATE USER
router.post("/create", protect, orderController.createOrder);

// GET ALL ORDER
router.get("/", protect, isAdminOrSuperAdmin, orderController.getAllOrders);

// GET SPECIFIC USER
router.get("/specific/:id", protect, canManageUser, orderController.getUserOrders);

// UPDATE ORDER
router.put("/update-details/:id", protect, orderController.updateOrderDetails);

// UPDATE STATUS
router.put("/update-status/:id", protect, orderController.updateOrderStatus);

// DELETE STATUS
router.delete("/delete/:id", protect, orderController.deleteOrder);

module.exports = router;
