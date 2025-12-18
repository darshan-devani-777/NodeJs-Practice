const express = require("express");
require("dotenv").config();

var router = express.Router();

const purchasesController = require("../controllers/purchases_controller");
var { verifyToken } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/history").get(verifyToken, purchasesController.purchaseHistory);
router.route("/payment").post(verifyToken, purchasesController.makePurchase);

module.exports = router;
