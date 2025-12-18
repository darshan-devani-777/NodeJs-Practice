const express = require('express');
const orderRoute = express.Router();
const {userVerifyToken} = require('../../Helpers/user.VerifyToken');
const {
    addNewOrder,
    getAllOrders,
    getOrder,
    deleteOrder
} = require('../../Controller/User/order.controller');

// ADD NEW ORDER
orderRoute.post('/add-New-Order', userVerifyToken, addNewOrder);

// GET ALL ORDER
orderRoute.get('/get-All-Order', userVerifyToken, getAllOrders);

// GET SPECIFIC ORDER
orderRoute.get('/get-Specific-Order', userVerifyToken, getOrder);

// DELETE ORDER
orderRoute.delete('/delete-Order', userVerifyToken, deleteOrder);

module.exports = orderRoute;