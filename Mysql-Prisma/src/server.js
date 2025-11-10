const express = require('express');
const app = express();
const userRoutes = require('./route/user.route');
const productRoutes = require('./route/product.route');
const cartRoutes = require('./route/cart.route');
const orderRoutes = require('./route/order.route');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server Start At http://localhost:${PORT}`);
});
