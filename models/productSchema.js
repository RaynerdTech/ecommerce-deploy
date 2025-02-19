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
            "Accessories",
            "Footwear",
            "Shirts",
            "Trousers",
            "Suits",
            "Gowns",
            "light",
            "slippers",
            "tracks",
            "jerseys",
            "heels",
            "handbags",
            "watches",
            "necklaces"
        ],
    },
    brand: {
        type: String,
        required: true,
        enum: [ 
            'Nike', 'Adidas', 'Puma', 'Levi\'s', 'Gucci', 'Prada', 
            'Versace', 'Zara', 'H&M', 'Uniqlo', 'Under Armour', 
            'Calvin Klein', 'Tommy Hilfiger'
        ],
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
    color: {
        type: [String],
        enum: ['white', 'black', 'blue', 'red', 'green', 'yellow', 'gold', 'silver', 'pink', 'purple', 'brown'], // Add as needed
    },
    tags: {
        type: [String], // Tags for filtering
        enum: ['wedding', 'party', 'formal', 'casual', 'office', 'beach', 'sports'],
    },
    compatibleWith: {
        type: [String], // Array of compatible colors, e.g., ['white', 'gold']
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female'], // Gender specification for filtering
    },
    occasion: {
        type: [String], // Array of occasions the product is suitable for
        enum: ['wedding', 'party', 'formal', 'casual', 'office', 'beach', 'sports'], // Expand as needed
    },
    mainItem: {
        type: Boolean,
        default: false, // Indicates if the item is a main clothing item (e.g., gown, shirt, trousers)
    },
    likes: {
        type: [String],
        ref: 'User',
        default: [],
      },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
