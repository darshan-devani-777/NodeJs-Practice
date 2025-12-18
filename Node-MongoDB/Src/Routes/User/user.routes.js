const express = require('express');
const userRoute = express.Router();
const { userVerifyToken } = require('../../Helpers/user.VerifyToken');
const {
    registerUser,
    loginUser,
    getAllUser,
    getUser,
    updateUser,
    deleteUser
} = require('../../Controller/User/user.controller');


// REGISTER USER
userRoute.post('/register-User',registerUser);

// LOGIN USER
userRoute.post('/login-User',loginUser);

// GET ALL USER
userRoute.get('/get-All-User',userVerifyToken, getAllUser);

// GET SPECIFIC USER
userRoute.get('/get-Specific-User',userVerifyToken, getUser);

// UPDATE USER
userRoute.put('/update-User',userVerifyToken, updateUser);

// DELETE USER
userRoute.delete('/delete-User',userVerifyToken, deleteUser);

module.exports = userRoute;