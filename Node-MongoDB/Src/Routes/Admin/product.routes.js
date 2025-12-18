const express = require('express');
const productRoutes = express.Router();

const { adminVerifyToken } = require('../../Helpers/user.VerifyToken');
const {
    addNewProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../../Controller/Admin/product.controller');

// ADD PRODUCT
productRoutes.post('/add-Product', adminVerifyToken, addNewProduct);

// GET ALL PRODUCT
productRoutes.get('/get-All-Product', adminVerifyToken, getAllProducts);

// GET SPECIFIC PRODUCT
productRoutes.get('/get-Specific-Product', adminVerifyToken, getProduct);

// UPDATE PRODUCT
productRoutes.put('/update-Product', adminVerifyToken, updateProduct);

// DELETE PRODUCT
productRoutes.delete('/delete-Product', adminVerifyToken, deleteProduct);

module.exports = productRoutes;