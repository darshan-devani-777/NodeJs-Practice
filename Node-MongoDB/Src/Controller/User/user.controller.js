const UserServices = require('../../Service/user.service');
const response = require("../../Helpers/response");
const userService = new UserServices();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

const checkIfUserExists = async (email) => {
    return await userService.getUser({ email });
};

const generateToken = (userId) => {
    return jwt.sign({ userId }, 'User');
};

const checkPasswordMatch = async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword);
};

const getUserById = async (userId) => {
    return await userService.getUserById(userId);
};

// REGISTER USER
exports.registerUser = async (req, res) => {
    try {
        let user = await checkIfUserExists(req.body.email);
        if (user) return response.reply(res, 400, true, 'User Is Already Registered...');
        
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        user = await userService.addNewUser({ ...req.body, password: hashPassword, isAdmin: false });
        
        return response.reply(res, 201, false, 'User Registered Successfully...', user);
    } catch (error) {
        return handleError(res, error);
    }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
    try {
        let user = await userService.getUser({ email: req.body.email, isDelete: false });
        if (!user) return response.reply(res, 404, true, 'Email Not Found...');
        
        const isPasswordValid = await checkPasswordMatch(req.body.password, user.password);
        if (!isPasswordValid) return response.reply(res, 401, true, 'Password Not Match...');
        
        const token = generateToken(user._id);

        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            email: user.email,
            password: user.password
        };

        return response.reply(res, 200, false, 'User Login Successfully...', { token, user: userData });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET ALL USERS
exports.getAllUser = async (req, res) => {
    try {
        let users = await userService.getAllUser({ isDelete: false , isAdmin:false });
        if (!users) return response.reply(res, 404, true, 'Users Not Found...');
        
        return response.reply(res, 200, false, 'Users Retrieved Successfully...', users);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET SPECIFIC USER
exports.getUser = async (req, res) => {
    try {
        let user = await getUserById(req.query.userId);
        if (!user) return response.reply(res, 404, true, 'User Not Found...');
        
        return response.reply(res, 200, false, 'User Retrieved Successfully...', user);
    } catch (error) {
        return handleError(res, error);
    }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
    try {
        let user = await getUserById(req.query.userId);
        if (!user) return response.reply(res, 404, true, 'User Not Found...');
        
        user = await userService.updateUser(user._id, { ...req.body });
        return response.reply(res, 201, false, 'User Updated Successfully...', user);
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        let user = await getUserById(req.query.userId);
        if (!user) return response.reply(res, 404, true, 'User Not Found...');
        
        user = await userService.updateUser(user._id, { isDelete: true });
        return response.reply(res, 200, false, 'User Deleted Successfully...', user);
    } catch (error) {
        return handleError(res, error);
    }
};
