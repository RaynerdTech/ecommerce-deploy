// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { createProduct, productQuery, likeProduct} = require('../controller/product');
const { verify } = require('../middleware/verify'); 

router.post('/create-product', verify, createProduct); 
router.put('/productlike/:id', verify, likeProduct); 
router.get('/products', productQuery);

module.exports = router;

 