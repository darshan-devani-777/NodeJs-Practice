// review.routes.js

const express = require('express');
const ReviewRoutes = express.Router();
const { userVerifyToken } = require('../../Helpers/user.VerifyToken');

// Import controller methods
const { addReview, getAllReview, deleteReview } = require('../../Controller/User/review.controller');

// ADD REVIEW
ReviewRoutes.post('/add-New-Review', userVerifyToken, addReview);

// GET ALL REVIEW
ReviewRoutes.get('/get-All-Review', userVerifyToken, getAllReview);

// DELETE REVIEW
ReviewRoutes.delete('/delete-Review', userVerifyToken, deleteReview);

module.exports = ReviewRoutes;
