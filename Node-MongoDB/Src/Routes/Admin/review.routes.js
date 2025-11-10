const express = require('express');
const ReviewRoutes = express.Router();
const { adminVerifyToken }  = require('../../Helpers/user.VerifyToken');

const {  getAllReview ,  deleteReview } = require('../../Controller/Admin/review.controller');


// GET ALL REVIEW
ReviewRoutes.get('/get-All-Review' , adminVerifyToken,  getAllReview);

// DELETE REVIEW
ReviewRoutes.delete('/delete-Review' , adminVerifyToken , deleteReview);


module.exports = ReviewRoutes;