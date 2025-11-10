const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Title 3 characters long'],
        maxlength: [30, 'Title cannot exceed 30 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: [{
        type: String,
        trim: true,
        required: [true, 'At least one category is required'],
        minlength: [2, 'Category name 2 characters long']
    }],
    isDelete: {
        type: Boolean,
        default: false
    }
},
{
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('products', productSchema);
