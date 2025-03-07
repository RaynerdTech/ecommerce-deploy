const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, gender, role } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user
        const newUser = new User({
            name,
            email,
            password, // Password hashing is already handled in the schema
            gender,
            role   
        });
     
        // Save the user in the database
        const savedUser = await newUser.save(); 

        // Respond with the registered user info (no cookie)
        res.status(201).json({ message: "User registered successfully", user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            gender: newUser.gender,
            role: newUser.role // Optional, if you want to include role
        } });

    } catch (err) {
        res.status(500).json({ error: "Server error while registering user" });
        console.log(err)
    }
};




//LOGIN USER 
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Respond with the token for client-side storage
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email, 
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Server error while logging in" });
    }
};
 
    
//LOGOUT 
const logout = (req, res) => {
    try {
        // Respond with a success message
        return res.status(200).json({ message: `Successfully logged out, ${req.user.role}` });
    } catch (error) {
        // Handle server errors
        console.error(error);
        return res.status(500).json({ error: "Failed to logout, please try again later" });
    }
};




module.exports = { register, login, logout };
