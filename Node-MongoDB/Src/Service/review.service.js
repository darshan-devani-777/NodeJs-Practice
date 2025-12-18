const Review = require('../Model/review.model');

module.exports = class ReviewServieces {

    // ADD NEW REVIEW
    async addNewReview(body) {
        try {
            return await Review.create(body);
        } catch (error) {
            console.log(error);
            return error.message;
        }
    };

    // GET ALL REVIEW
    async getAllReview(query) {
        try {
            let product = query.productId && query.productId !== undefined ? [
                {
                    $match: { product: query.productId }
                }
            ] : [];
            let find = [
                { $match: { isDelete: false } },
                ...product,

            ];

            let result = await Review.aggregate(find);
            return result;
        } catch (error) {
            console.log(error);
            return error.message;
        }
    };

    //  GET SPECIFIC REVIEW
    async getReview(query) {
        try {
            return await Review.findOne(query);
        } catch (error) {
            console.log(error);
            return error.message;
        }
    };

    //  GET SPECIFIC REVIEW BY ID
    async getReviewById(id) {
        try {
            return await Review.findById(id);
        } catch (error) {
            console.log(error);
            return error.message;
        }
    };

    //  UPDATE REVIEW
    async updateReview(id, body) {
        try {
            return await Review.findByIdAndUpdate(id, { $set: body }, { new: true });
        } catch (error) {
            console.log(error);
            return error.message;
        }
    };
}