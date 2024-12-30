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
        enum: [
            "Men's Clothing",
            "Women's Clothing",
            "Kids' Clothing",
            "Accessories",
            "Footwear",
            "Activewear",
            "Outerwear",
            "Formalwear",
            "Casualwear",
            "Ethnicwear"
        ],
    },
    brand: {
    type: String,
    required: true,
    enum: ['Nike', 'Adidas', 'Puma', 'Levi\'s', 'Gucci', 'Prada', 'Versace', 'Zara', 'H&M', 'Uniqlo', 'Under Armour', 'Calvin Klein', 'Tommy Hilfiger'],
    message: 'Brand must be one of the predefined options',
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
