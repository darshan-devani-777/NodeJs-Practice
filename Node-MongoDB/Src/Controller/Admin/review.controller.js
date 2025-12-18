const ReviewServices = require('../../Service/review.service');
const response = require("../../Helpers/response");
const reviewService = new ReviewServices();

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

// GET ALL REVIEW
exports.getAllReview = async(req , res) => {
    try {
        let review = await reviewService.getAllReview(req.query);
        return response.reply(res , 200 , false , 'Review Retrieved SuccessFully...');
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE REVIEW
exports.deleteReview = async(req , res) => {
    try {
        let review = await reviewService.getReviewById(req.query.reviewId);
        if(!review){
            return response.reply(res , 404 , true , 'Review Not Found...');
        }
        review = await reviewService.updateReview(review._id , {isDelete: true});
        return response.reply(res , 200 , false , 'Review Deleted SuccessFully...');
    } catch (error) {
        return handleError(res, error);
    }
}