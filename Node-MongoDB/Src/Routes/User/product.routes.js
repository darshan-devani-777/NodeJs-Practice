const express = require('express');
const productRoute = express.Router();

const {
    getAllProducts,
    getProduct
} = require('../../Controller/User/product.controller');

// GET ALL PRODUCT
productRoute.get('/get-All-Product', getAllProducts);

// GET SPECIFIC PRODUCT
productRoute.get('/get-Specific-Product', getProduct);

module.exports = productRoute;