const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');

// CREATE USER
router.post('/', userController.createUser);

// GET ALL USER
router.get('/', userController.getAllUsers);

// GET USER BY ID
router.get('/:id', userController.getUserById);

// UPDATE USER
router.put('/:id', userController.updateUser);

// DELETE USER
router.delete('/:id', userController.deleteUser);

module.exports = router;
