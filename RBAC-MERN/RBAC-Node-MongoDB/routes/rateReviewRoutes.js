const express = require("express");
const router = express.Router();
const rateReviewController = require("../controllers/rateReviewController");
const { roleMiddleware } = require("../middlewares/rbacMiddleware");
const {protect} = require("../middlewares/authMiddleware");

// CREATE REVIEW
router.post("/create", protect, roleMiddleware(["user"]) , rateReviewController.createReview);

// GET SPECIFIC REVIEW
router.get("/product/:productId", protect ,  roleMiddleware(["user" , "admin", "superadmin"]) , rateReviewController.getReview);

// GET ALL REVIEW
router.get("/", protect , roleMiddleware(["admin", "superadmin"]) , rateReviewController.getAllReviews);

// UPDATE REVIEW
router.put("/update/:reviewId", protect, roleMiddleware(["user"]) , rateReviewController.updateReview);

// DELETE REVIEW
router.delete("/delete/:reviewId", protect, roleMiddleware(["user" , "admin" , "superadmin"]) , rateReviewController.deleteReview);

module.exports = router;
