const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart.controller');

// ADD TO CART
router.post('/add', cartController.addToCart);

// GET CART
router.get('/:userId', cartController.getCartItems);

// REMOVE CART
router.delete('/remove', cartController.removeFromCart);

// CLEAR CART
router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;
