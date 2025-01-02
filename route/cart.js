const express = require('express');
const { addToCart, viewCart, removeFromCart, decreaseProductQuantity, clearCart, initiatePayment} = require('../controller/cart');
const { verify } = require('../middleware/verify');

const router = express.Router();

router.post('/add-cart', verify, addToCart); // Add items to the cart
router.get('/cart', verify, viewCart); // View the user's cart
router.delete('/remove-a-product', verify, removeFromCart); // Remove items from the cart
router.post('/cart-decrease', verify, decreaseProductQuantity);
router.delete('/clear-cart', verify, clearCart);
router.post('/initiate-payment', verify, initiatePayment); // Start payment


module.exports = router;
