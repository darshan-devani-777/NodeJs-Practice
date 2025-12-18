const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptions_controller");

router.post("/subscribe", subscriptionController.subscribeEmail);
router.post("/unsubscribe", subscriptionController.unsubscribeEmail);

module.exports = router;
