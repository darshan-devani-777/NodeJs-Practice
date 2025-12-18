const adminRoutes = require('express').Router();
const userRoutes = require('./admin.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const ReviewRoutes = require('./review.routes');

adminRoutes.use('/', userRoutes);
adminRoutes.use('/product', productRoutes);
adminRoutes.use('/cart', cartRoutes);
adminRoutes.use('/review' , ReviewRoutes);

module.exports = adminRoutes; 