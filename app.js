const express = require("express");
const app = express();
const cors = require("cors"); // Import cors
require('dotenv').config();
const port = process.env.PORT || 3000;

const authRoute = require('./route/auth');
const productRoute = require('./route/product');
const cartRoute = require('./route/cart');

app.use(express.json());
const mongoose = require('mongoose');

// Cookie parser 
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// CORS configuration - allow all origins (for development)
app.use(cors()); // Add this line to enable CORS

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Mongoose is connected"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

// Routes
app.use(authRoute);    
app.use(productRoute);
app.use(cartRoute);

app.listen(port, () => { 
    console.log(`App is running on port ${port}`);
});
