const User = require('../Model/user.model');

module.exports = class UserServices {
    // ADD USER
    addNewUser = async(body) => {
        return await User.create(body);
    };
    
    // GET All USER
    getUser = async(body) => {
        return await User.findOne(body);
    };

    // GET ALL USERS
    getAllUser = async(body) => {
        return await User.find(body);
    };

    // GET SPECIFIC USERS
    getUserById = async(id) => {
        return await User.findById(id);
    };

    // UPDATE USER
    updateUser = async(id ,body) => {
        return await User.findByIdAndUpdate(id ,{$set:body} , {new:true});
    }
};