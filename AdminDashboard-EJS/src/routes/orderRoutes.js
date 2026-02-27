const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// CREATE ORDER
router.post("/create", protect, authorizeRoles("user", "admin"), orderController.createOrder);

// GET ORDER STATS
router.get("/stats", protect, authorizeRoles("admin"), orderController.getOrderStats);

// GET USER ORDERS
router.get("/my-orders", protect, authorizeRoles("user", "admin"), orderController.getUserOrders);

// GET SINGLE ORDER
router.get("/specific/:orderId", protect, authorizeRoles("user", "admin"), orderController.getOrder);

// GET ALL ORDERS
router.get("/all-orders", protect, authorizeRoles("admin"), orderController.getAllOrders);

// UPDATE ORDER STATUS
router.put("/:orderId/status", protect, authorizeRoles("admin"), orderController.updateOrderStatus);

// CANCEL ORDER
router.delete("/:orderId/cancel", protect, authorizeRoles("user", "admin"), orderController.cancelOrder);

// USER REFUND REQUEST
router.post("/refund/request", protect, authorizeRoles("user", "admin"), orderController.requestRefund);
  
// ADMIN UPDATE REFUND
router.put("/refund/:refundId", protect, authorizeRoles("admin"), orderController.updateRefundStatus);

// GET ALL REFUNDS
router.get("/refund/get-all-refunds", protect, authorizeRoles("admin"), orderController.getAllRefunds);

// GET SPECIFIC REFUND
router.get("/refund/my-refunds", protect, authorizeRoles("user", "admin"), orderController.getUserRefunds);

module.exports = router;
