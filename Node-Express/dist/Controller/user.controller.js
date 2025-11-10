"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const user_model_1 = require("../Model/user.model");
// CREATE USER
const createUser = (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and Email are required",
        });
    }
    const newUser = new user_model_1.User(user_model_1.users.length + 1, name, email);
    user_model_1.users.push(newUser);
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
    });
};
exports.createUser = createUser;
// GET ALL USERS
const getAllUsers = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: user_model_1.users,
    });
};
exports.getAllUsers = getAllUsers;
// GET SPECIFIC USER
const getUserById = (req, res) => {
    const user = user_model_1.users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
    });
};
exports.getUserById = getUserById;
// UPDATE USER
const updateUser = (req, res) => {
    const user = user_model_1.users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    const { name, email } = req.body;
    if (name)
        user.name = name;
    if (email)
        user.email = email;
    return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
    });
};
exports.updateUser = updateUser;
// DELETE USER
const deleteUser = (req, res) => {
    const index = user_model_1.users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    const deletedUser = user_model_1.users.splice(index, 1)[0];
    return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
    });
};
exports.deleteUser = deleteUser;
