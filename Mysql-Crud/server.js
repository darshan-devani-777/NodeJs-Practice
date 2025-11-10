const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
app.use(express.urlencoded({ extended: true }));

const userController = require('./src/Controller/user.controller');
const productController = require('./src/Controller/product.controller');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// ROUTES
app.get('/addUser', userController.showAddUserForm);   
app.post('/addUser', userController.addUser);          

app.get('/addProduct', productController.showAddProductForm); 
app.post('/addProduct', productController.addProduct);  

app.get('/getProducts' , userController.getUsersWithProducts);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server Start At http://localhost:${port}`);
});
