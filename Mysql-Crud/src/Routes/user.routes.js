const express = require('express');
const router = express.Router();
const userController = require('../Controller/user.controller');

router.get('/', userController.showAddUserForm);

router.post('/add', userController.addUser);

router.get('/getProducts', userController.getUsersWithProducts);


module.exports = router;
