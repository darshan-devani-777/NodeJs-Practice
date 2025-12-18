const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');

// CREATE PRODUCT
router.post('/', productController.createProduct);

// GET ALL PRODUCTS
router.get('/', productController.getAllProducts);

// GET PRODUCT BY ID
router.get('/:id', productController.getProductById);

// UPDATE PRODUCT
router.put('/:id', productController.updateProduct);

// DELETE PRODUCT
router.delete('/:id', productController.deleteProduct);

module.exports = router;
