const Product = require('../models/productSchema');


// Create a new product (restricted to logged-in users)
const createProduct = async (req, res) => {
    try {
        // Get user info from the verified token
        const userId = req.user.id;
        
        // Ensure only admin users can create products (optional, based on role)
        if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: "Access denied: You are not authorized to create products." });
        }

        // Create a new product using spread operator
        const newProduct = new Product({
            creatorId: userId, // Track which user created the product
            ...req.body // Spread operator to include all other properties
        });

        // Save product in the database
        const savedProduct = await newProduct.save();
        res.status(201).json({ message: `Product created successfully, ${req.user.role}`, product: savedProduct });
    } catch (error) {
        res.status(500).json({ error: "Server error while creating product" });
        console.log(error)
    }
};


const productQuery = async (req, res) => {
    try {
      const { name, category, brand, price } = req.query; // Destructure query parameters from the request URL
      let query = {}; // Initialize an empty query object to build dynamic queries
  
      // Build the query object dynamically based on the query parameters
      if (name) query.name = name; // If 'name' query parameter is provided, add it to the query object
      if (category) query.category = category; // If 'category' query parameter is provided, add it to the query object
      if (brand) query.brand = brand; // If 'brand' query parameter is provided, add it to the query object
      if (price) {
        if (price.includes('-')) {
          // Check if price query is a range
          const [min, max] = price.split('-').map(Number); // Split the price range into min and max, then convert to numbers
          query.price = { $gte: min, $lte: max }; // Use MongoDB comparison operators for the price range ($gte = greater than or equal, $lte = less than or equal)
        } else {
          query.price = Number(price); // If it's not a range, treat it as an exact price and add it to the query object
        }
      }
  
      // Fetch products from the database based on the query object
      const products = await Product.find(query); // Perform a MongoDB 'find' operation using the built query object
  
      // If matching products are found, respond with the products
      if (products.length > 0) {
        res.json({ message: 'Product(s) found', data: products }); // Send a JSON response with the found products
      } else {
        res.json({ message: 'No products found matching the query parameters' }); // Send a response indicating no products were found
      }
  
    } catch (error) {
      res.status(500).json({ error: 'Server error while fetching products' }); // Catch and respond to any server or database errors
    }
  };
  
module.exports = { createProduct, productQuery };
