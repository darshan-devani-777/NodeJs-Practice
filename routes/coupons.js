const express = require("express");
require("dotenv").config();

var router = express.Router();

const couponsController = require("../controllers/coupons_controller");
var { verifyToken, verifyTokenAdmin } = require("../middlewares/verifyToken");
require("dotenv").config();

router.route("/getCoupons").get(verifyToken, couponsController.getCoupons);
router.route("/create").post(verifyToken, couponsController.createCoupon);
router.route("/delete/:coupon_id").delete(verifyToken, couponsController.deleteCoupon);

router.route("/admin/list").get(verifyTokenAdmin, (req, res, next) => {
    res.render('coupons', {
        currentPage: 'coupons', currentSubPage: ''
    })
});

module.exports = router;
