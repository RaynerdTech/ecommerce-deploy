// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, 
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String, 
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    image: {
        type: String, // You can store image URLs or paths here
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true // Mark as required
    },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
