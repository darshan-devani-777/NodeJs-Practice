const express = require('express');
const bodyParser = require('body-parser');
const { Database } = require('./Src/Model/user.model');
const userRoutes = require('./Src/Routes/user.route');
const productRoutes = require('./Src/Routes/product.route');
require('dotenv').config(); 

const app = express();
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/products', productRoutes);

Database();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Start At http://localhost:${PORT}`);
});
