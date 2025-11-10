const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        minlength: [2, 'FirstName 3 characters long'],
        maxlength: [10, 'FirstName cannot exceed 10 characters']
    },
    lastName: {
        type: String,
        trim: true,
        minlength: [2, 'LastName 2 characters long'],
        maxlength: [10, 'LastName cannot exceed 10 characters']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, 'Gender is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password 6 characters long']
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
{
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('users', userSchema);
