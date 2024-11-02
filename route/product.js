// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { createProduct, productQuery } = require('../controller/product'); // Adjust the path based on your structure
const { verify } = require('../middleware/verify'); // Import the verify middleware

// Route for creating a new product
router.post('/create-product', verify, createProduct); // Ensure user is verified before 
router.get('/products', productQuery);

module.exports = router;
