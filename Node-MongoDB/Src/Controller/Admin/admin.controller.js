const UserServices = require('../../Service/user.service');
const response = require("../../Helpers/response");
const userService = new UserServices();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleError = (res) => {
    return response.reply(res, 500, true, 'Internal Server Error...');
};

const checkIfAdminExists = async (email) => {
    return await userService.getUser({ email });
};

const generateToken = (adminId) => {
    return jwt.sign({ adminId }, 'Admin');
};

const checkPasswordMatch = async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword);
};

const getAdminById = async (adminId) => {
    return await userService.getUserById(adminId);
};

// REGISTER ADMIN
exports.registerAdmin = async (req, res) => {
    try {
        let admin = await checkIfAdminExists(req.body.email);
        if (admin) return response.reply(res, 400, true, 'Admin Is Already Registered...');
        
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        admin = await userService.addNewUser({ ...req.body, password: hashPassword, isAdmin: true });
        
        return response.reply(res, 201, false, 'Admin Added Successfully...', admin);
    } catch (error) {
        return handleError(res, error);
    }
};

// LOGIN ADMIN
exports.loginAdmin = async (req, res) => {
    try {
        let admin = await userService.getUser({ email: req.body.email, isDelete: false });
        if (!admin) return response.reply(res, 404, true, 'Email Not Found...');
        
        const isPasswordValid = await checkPasswordMatch(req.body.password, admin.password);
        if (!isPasswordValid) return response.reply(res, 401, true, 'Password Not Match...');
        
        const token = generateToken(admin._id);

        const adminData = {
            _id: admin._id,
            firstName:admin.firstName,
            lastName:admin.lastName,
            gender:admin.gender,
            email: admin.email,
            password:admin.password
        };

        return response.reply(res, 200, false, 'Admin Login Successfully...', { token, admin: adminData });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET ALL ADMIN
exports.getAllAdmin = async (req, res) => {
    try {
        let admin = await userService.getAllUser({ isDelete: false , isAdmin:true});
        if (!admin) return response.reply(res, 404, true, 'Admins Not Found...');
        
        return response.reply(res, 200, false, 'Admins Retrieved Successfully...', admin);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET SPECIFIC ADMIN
exports.getAdmin = async (req, res) => {
    try {
        let admin = await getAdminById(req.query.adminId);
        if (!admin) return response.reply(res, 404, true, 'Admin Not Found...');
        
        return response.reply(res, 200, false, 'Admin Retrieved Successfully...', admin);
    } catch (error) {
        return handleError(res, error);
    }
};

// UPDATE ADMIN
exports.updateAdmin = async (req, res) => {
    try {
        let admin = await getAdminById(req.query.adminId);
        if (!admin) return response.reply(res, 404, true, 'Admin Not Found...');
        
        admin = await userService.updateUser(admin._id, { ...req.body });
        return response.reply(res, 201, false, 'Admin Updated Successfully...', admin);
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE ADMIN
exports.deleteAdmin = async (req, res) => {
    try {
        let admin = await getAdminById(req.query.adminId);
        if (!admin) return response.reply(res, 404, true, 'Admin Not Found...');
        
        admin = await userService.updateUser(admin._id, { isDelete: true });
        return response.reply(res, 200, false, 'Admin Deleted Successfully...', admin);
    } catch (error) {
        return handleError(res, error);
    }
};
