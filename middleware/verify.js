const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  // Get the JWT token from the cookie
  const { user_token } = req.cookies;

  // Check if the token is missing
  if (!user_token) {
    return res.status(401).json({ message: "You are not logged in" });
  }

  // Verify the token
  jwt.verify(user_token, process.env.JWT_SECRET, (error, info) => {
    if (error) {
      // If the token is invalid or expired, send a 403 Forbidden error
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Store the user info in the request object for use in the next middleware
    req.user = info;
    console.log(info)

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = { verify };
