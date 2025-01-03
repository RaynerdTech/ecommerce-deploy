const express = require("express");
const cors = require("cors"); // Import cors
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser"); // Cookie parser 
const mongoose = require("mongoose");

const authRoute = require("./route/auth");
const productRoute = require("./route/product");
const cartRoute = require("./route/cart");

const port = process.env.PORT || 3000;

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// CORS configuration - allow specific origin and credentials
// app.use(
//   cors({
//     origin: "http://127.0.0.1:5500", // Replace with your frontend URL
//     credentials: true, // Allow cookies to be sent and received
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Add headers you expect
//   })
// );

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongoose is connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Routes
app.use(authRoute);
app.use(productRoute);
app.use(cartRoute);

// Start the server
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
