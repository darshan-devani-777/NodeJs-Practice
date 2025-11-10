const RateReview = require("../models/rateReviewModel");
const Product = require("../models/productModel");

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = new RateReview({
      user: req.user._id,
      product: productId,
      rating,
      review,
    });

    await newReview.save();

    product.reviews.push(newReview._id);
    await product.save();

    const updatedProduct = await Product.findById(productId).populate({
      path: "reviews",
      populate: { path: "user", select: "name email" },
    });

    return res.status(201).json({
      success: true,
      message: "Review Created Successfully...",
      review: newReview,
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating review",
      error,
    });
  }
};

// GET ALL REVIEW
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await RateReview.find().populate("user", "name _id");

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    }

    return res.status(200).json({
      message: "Reviews Fetched Successfully...",
      reviews: reviews,
    });
  } catch (error) {
    console.error(error); 
    return res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// GET SPECIFIC REVIEW 
exports.getReview = async (req, res) => {
  try {
    const reviews = await RateReview.find({ product: req.params.productId })
      .populate("user", "name") 
      .populate("product", "name description price"); 

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this product" });
    }

    return res.status(200).json({
      message: "Reviews Fetched Successfully...",
      productId: req.params.productId, 
      reviews: reviews, 
    });
  } catch (error) {
    console.error(error); 
    return res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// UPDATE REVIEW 
exports.updateReview = async (req, res) => {
  try {
    const review = await RateReview.findById(req.params.reviewId).populate("product", "name description price");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this review" });
    }

    review.rating = req.body.rating || review.rating;
    review.review = req.body.review || review.review;

    await review.save();

    return res.status(200).json({
      message: "Review Updated Successfully...",
      review: review,
      product: review.product, 
    });
  } catch (error) {
    console.error(error); 
    return res.status(500).json({ message: "Error updating review", error: error.message });
  }
};

// DELETE REVIEW 
exports.deleteReview = async (req, res) => {
  try {
    const review = await RateReview.findById(req.params.reviewId).populate("product", "name description price");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdminOrSuperAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdminOrSuperAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this review" });
    }

    console.log("Deleting review:", review);

    await RateReview.findByIdAndDelete(req.params.reviewId);

    return res.status(200).json({
      message: "Review Deleted Successfully...",
      deletedReview: review,
      product: review.product,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};




