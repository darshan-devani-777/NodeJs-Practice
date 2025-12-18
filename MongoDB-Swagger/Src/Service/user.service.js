const User = require('../Model/user.model');
const bcrypt = require('bcrypt');

// CREATE USER
const createUser = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
    });
    return await newUser.save();
};

// GET ALL USER
const getAllUsers = async () => {
    return await User.find();
};

// GET USER BY ID
const getUserById = async (id) => {
    return await User.findById(id);
};

// UPDATE USER
const updateUser = async (id, userData) => {
    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
    }
    return await User.findByIdAndUpdate(id, userData, { new: true });
};

// DELETE USER
const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
