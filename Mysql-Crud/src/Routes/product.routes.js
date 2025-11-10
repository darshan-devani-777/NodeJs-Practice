const express = require('express');
const router = express.Router();
const productController = require('../Controller/product.controller');

router.get('/addProduct', productController.showAddProductForm);
router.post('/addProduct', productController.addProduct);

module.exports = router;
