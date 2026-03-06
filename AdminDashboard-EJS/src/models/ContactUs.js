const mongoose = require('mongoose');
const validator = require('validator');

const ContactUsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: 'Please provide a valid email'
      }
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          if (!value) return true; 
          return validator.isMobilePhone(value, 'any');
        },
        message: 'Please provide a valid phone number'
      }
    },

    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },

    isRead: {
      type: Boolean,
      default: false
    },

    replied: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactUs', ContactUsSchema);