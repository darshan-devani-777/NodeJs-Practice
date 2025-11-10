const express = require('express');
const userRoutes = express.Router();
const { adminVerifyToken } = require('../../Helpers/user.VerifyToken');
const {
    registerAdmin,
    loginAdmin,
    getAllAdmin,
    getAdmin,
    updateAdmin,
    deleteAdmin
} = require('../../Controller/Admin/admin.controller');

// REGISTER ADMIN
userRoutes.post('/register-Admin',registerAdmin);

// LOGIN ADMIN
userRoutes.post('/login-Admin',loginAdmin);

// GET ALL ADMIN
userRoutes.get('/get-All-Admin',adminVerifyToken, getAllAdmin);

// GET SPECIFIC ADMIN
userRoutes.get('/get-Specific-Admin',adminVerifyToken, getAdmin);

// UPDATE ADMIN
userRoutes.put('/update-Admin',adminVerifyToken, updateAdmin);

// DELETE ADMIN
userRoutes.delete('/delete-Admin',adminVerifyToken, deleteAdmin);

module.exports = userRoutes; 