const Cart = require('../models/cartSchema'); // Import the Cart model
const Product = require('../models/productSchema'); // Import the Product model
const { verify } = require('../middleware/verify'); // Import your authentication middleware if needed


const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id; // Assuming the user ID is available through the token (from `verify` middleware)

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }


        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a new cart for the user if it doesn't exist
            cart = new Cart({
                userId,
                items: [],
                totalPrice: 0
            });
        }

        // Check if product already exists in the cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex !== -1) {
            // If product already exists in cart, update the quantity and price
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = cart.items[existingItemIndex].quantity * product.price;
        } else {
            // If product is not in the cart, add it as a new item
            const newItem = {
                productId: product._id,
                quantity,
                price: quantity * product.price
            };
            cart.items.push(newItem);
        }

        // Update the total price of the cart
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);

        // Save the cart
        const updatedCart = await cart.save();
    
        res.status(200).json({ message: "Product added to cart", cart: updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding product to cart" });
    }
};


//VIEW CART
const viewCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');
        if (!cart) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        res.status(200).json({ cart });

    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve cart' });
    }
};


//REMOVE CART 
const removeFromCart = async (req, res) => {
    const userId = req.user.id; // Assuming user is logged in
    const { productId } = req.body;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove the product from the cart
        cart.items.splice(itemIndex, 1);

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart', cart });

    } catch (error) {
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }
};


//DECREASE CART 
const decreaseProductQuantity = async (req, res) => {
    const userId = req.user.id; // Assuming user is logged in
    const { productId } = req.body; // Product ID to decrease quantity

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        const item = cart.items[itemIndex];

        if (item.quantity > 1) {
            // Decrease quantity
            item.quantity -= 1;

            // Fetch product price from the Product model
            const product = await Product.findById(productId);

            // Update price based on new quantity
            item.price = item.quantity * product.price;

            // Recalculate total price for the entire cart
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

            await cart.save();
            res.status(200).json({ message: 'Product quantity decreased by 1', cart });
        } else {
            // If quantity is 1, remove the product from cart
            cart.items.splice(itemIndex, 1);

            // Recalculate total price
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

            await cart.save();
            res.status(200).json({ message: 'Product removed from cart', cart });
        }

    } catch (error) {
        res.status(500).json({ error: 'Failed to update product quantity in cart' });
    }
};





//CLEAR ENTIRE CART ONCE
const clearCart = async (req, res) => {
    const userId = req.user.id; // Assuming user is logged in

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear all items in the cart
        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();
        res.status(200).json({ message: 'Cart cleared', cart });

    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};





module.exports = { addToCart, viewCart, removeFromCart, decreaseProductQuantity, clearCart };