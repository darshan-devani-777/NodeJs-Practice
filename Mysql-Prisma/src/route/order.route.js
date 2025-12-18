const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");

// CREATE ORDER
router.post("/create-order", orderController.createOrder);

// GET ORDER HISTORY
router.get("/order-history/:userId", orderController.getOrderHistory);

// UPDATE ORDER STATUS
router.patch("/order-status/:id", orderController.updateOrderStatus);

// DELETE ORDER
router.delete('/delete-order/:id', orderController.deleteOrder);

module.exports = router;
