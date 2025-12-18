const express = require('express');
const cartRotes = express.Router();
const { userVerifyToken } = require('../../Helpers/user.VerifyToken');

const {
    addToCart,
    getAllCarts,
    getCart,
    updateCart,
    deleteCart
} = require('../../Controller/User/cart.controller');

// ADD CART
cartRotes.post('/add-To-Cart', userVerifyToken, addToCart);

// GET ALL CART
cartRotes.get('/get-All-Cart', userVerifyToken, getAllCarts);

// GET SPECIFIC CART
cartRotes.get('/get-Specific-Cart', userVerifyToken, getCart);

// UPDATE CART
cartRotes.put('/update-Cart', userVerifyToken, updateCart);

// DELETE CART
cartRotes.delete('/delete-Cart', userVerifyToken, deleteCart);

module.exports = cartRotes;