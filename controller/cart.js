const Cart = require('../models/cartSchema'); // Import the Cart model
const Product = require('../models/productSchema'); // Import the Product model
const { verify } = require('../middleware/verify'); // Import your authentication middleware if needed


const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }

        const userId = req.user.id; // User ID from token

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [], totalPrice: 0 });
        }

        // Check if product exists in cart
        const existingItemIndex = cart.items.findIndex((item) =>
            item.productId.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // Product exists, update quantity and price
            const existingItem = cart.items[existingItemIndex];
            existingItem.quantity += quantity;
            existingItem.price = existingItem.quantity * product.price;
        } else {
            // Product does not exist, add as new item
            const newItem = {
                productId: product._id,
                quantity,
                price: quantity * product.price,
            };
            cart.items.push(newItem);
        }

        // Update total cart price
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);

        // Save updated cart
        const updatedCart = await cart.save();

        // Populate response with product details
        const populatedCart = await updatedCart.populate('items.productId', 'name image');

        res.status(200).json({ message: "Product added to cart", cart: populatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding product to cart", error: error.message });
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
        } else {
            // If quantity is 1, remove the product from cart
            cart.items.splice(itemIndex, 1);

            // Recalculate total price
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

            await cart.save();
        }

        // Populate product details (name, image, etc.)
        const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name image');

        res.status(200).json({ message: 'Product quantity decreased by 1', cart: updatedCart });

    } catch (error) {
        console.error(error);
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
