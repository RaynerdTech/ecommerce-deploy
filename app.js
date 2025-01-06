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
const allowedOrigins = ["http://127.0.0.1:5500", "https://at.raynerd.com.ng"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "Accept"], // Expected headers
  })
);

 
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
