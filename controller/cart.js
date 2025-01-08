const Cart = require('../models/cartSchema'); // Import the Cart model
const Product = require('../models/productSchema'); 
// const Payment = require('../models/payment'); 
const axios = require('axios');


const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }

        let userId;

        // Check if the request is from Safari
        const userAgent = req.headers['user-agent'] || '';
        const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');

        if (isSafari) {
            // If Safari, get the token from localStorage and verify it manually
            const token = req.body.token || ''; // Token should be passed in the request body from the frontend
            if (!token) {
                return res.status(401).json({ message: "You are not logged in" });
            }

            // Verify the token manually (same as your middleware)
            jwt.verify(token, process.env.JWT_SECRET, (error, info) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }

                // Get user info from token
                userId = info.id; // User ID from the decoded token
            });
        } else {
            // For non-Safari, use the req.user object populated by the cookie-based middleware
            userId = req.user.id;
        }

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
        const populatedCart = await Cart.findById(updatedCart._id).populate(
            'items.productId',
            'name image price'
        );

        res.status(200).json({ message: "Product added to cart", cart: populatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding product to cart", error: error.message });
    }
};





//VIEW CART
const viewCart = async (req, res) => {
    try {
        let userId;

        // Check for token in cookies or body
        if (req.body.token) {
            // Token sent in body (for Safari/localStorage workaround)
            jwt.verify(req.body.token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else if (req.cookies.user_token) {
            // Token sent in cookies (default behavior for most browsers)
            jwt.verify(req.cookies.user_token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price image');
        if (!cart) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        res.status(200).json({ cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve cart' });
    }
};



//REMOVE CART 
const removeFromCart = async (req, res) => {
    try {
        let userId;

        // Check for token in cookies or body
        if (req.body.token) {
            // Token sent in body (for Safari/localStorage workaround)
            jwt.verify(req.body.token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else if (req.cookies.user_token) {
            // Token sent in cookies (default behavior for most browsers)
            jwt.verify(req.cookies.user_token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { productId } = req.body;

        // Check for product ID in the request
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the product in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Remove the product from the cart
        cart.items.splice(itemIndex, 1);

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: "Product removed from cart", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to remove product from cart" });
    }
};



//DECREASE CART 
const decreaseProductQuantity = async (req, res) => {
    try {
        let userId;

        // Check for token in body or cookies
        if (req.body.token) {
            // Token in body (for Safari/localStorage workaround)
            jwt.verify(req.body.token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else if (req.cookies.user_token) {
            // Token in cookies (default behavior)
            jwt.verify(req.cookies.user_token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { productId } = req.body;

        // Validate product ID
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the product in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        const item = cart.items[itemIndex];

        if (item.quantity > 1) {
            // Decrease quantity
            item.quantity -= 1;

            // Fetch product price
            const product = await Product.findById(productId);

            // Update item price based on quantity
            item.price = item.quantity * product.price;

            // Recalculate total cart price
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

            await cart.save();
        } else {
            // If quantity is 1, remove item from cart
            cart.items.splice(itemIndex, 1);

            // Recalculate total cart price
            cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);

            await cart.save();
        }

        // Populate updated cart with product details
        const updatedCart = await Cart.findById(cart._id).populate(
            'items.productId',
            'name image price'
        );

        res.status(200).json({ message: "Product quantity decreased by 1", cart: updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update product quantity in cart" });
    }
};





//CLEAR ENTIRE CART ONCE
const clearCart = async (req, res) => {
    try {
        let userId;

        // Check for token in body or cookies
        if (req.body.token) {
            // Token in body (for Safari/localStorage workaround)
            jwt.verify(req.body.token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else if (req.cookies.user_token) {
            // Token in cookies (default behavior)
            jwt.verify(req.cookies.user_token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(403).json({ message: "Invalid or expired token" });
                }
                userId = decoded.id;
            });
        } else {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Clear all items and reset total price
        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();

        res.status(200).json({ message: "Cart cleared", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to clear cart" });
    }
};



      


const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

// Initiate Payment
const initiatePayment = async (req, res) => {
  try {
    const { amount, currency, email, phone, fullName, address, country, zip } = req.body;

    if (!amount || !currency || !email || !phone || !fullName || !address || !country) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields in the payload.' 
      });
    }

    const payload = {
      tx_ref: `TX-${Date.now()}`, // Unique transaction reference
      amount,
      currency,
      customer: {
        email,
        phonenumber: phone,
        name: fullName,
      },
      meta: {
        address,
        country,
        zip,
      },
      redirect_url: "https://at.raynerd.com.ng", // Adjust this to your frontend verification page
    };

    console.log('Payload to Flutterwave:', payload);

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'success') {
      const paymentLink = response.data.data.link;

      // Include customer and meta information in the response
      return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully.',
        checkoutUrl: paymentLink,
        customer: {
          email,
          phone,
          fullName,
        },
        meta: {
          address,
          country,
          zip,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: response.data.message || 'Failed to initiate payment.',
      });
    }
  } catch (error) {
    console.error('Flutterwave API Error:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Payment initiation failed.',
      error: error.message,
    });
  }
};



// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status === "success") {
      res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        data: response.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }                            
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed.",
      error: error.message,
    });
  }
};
      
            
module.exports = { addToCart, viewCart, removeFromCart, decreaseProductQuantity, clearCart, initiatePayment, verifyPayment };
