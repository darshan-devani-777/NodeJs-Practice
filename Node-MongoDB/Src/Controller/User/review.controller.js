const ReviewServices = require('../../Service/review.service');
const response = require("../../Helpers/response");
const reviewService = new ReviewServices();

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// ADD REVIEW
exports.addReview = async (req, res) => {
    try {
        let review = await reviewService.getReview({
            user: req.user._id,
            product: req.query.productId,
            isDelete: false
        });
        if (review) {
            return response.reply(res , 400 , true , 'Review Already Exist...');
        }
        review = await reviewService.addNewReview({ ...req.body, user: req.user._id });
        return response.reply(res , 200 , false , 'Review Added SuccessFully...');
    } catch (error) {
        console.log(error);
        return handleError(res, error);
    }
};

// GET ALL REVIEWS
exports.getAllReview = async (req, res) => {
    try {
        let reviews = await reviewService.getAllReview(req.query);
        res.status(200).json(reviews);
    } catch (error) {
         return handleError(res, error);
    }
};

// DELETE REVIEW
exports.deleteReview = async (req, res) => {
    try {
        let review = await reviewService.getReviewById(req.query.reviewId);
        if (!review) {
            return response.reply(res , 404 , true , 'Review Not Found...');
        }
        review = await reviewService.updateReview(review._id, { isDelete: true });
        return response.reply(res , 200 , false , 'Review Deleted SuccessFully...');
    } catch (error) {
        return handleError(res, error);
    }
};
