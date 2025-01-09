const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  // Get the JWT token from the Authorization header
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is missing
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "You are not logged in" });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (error, info) => {
    if (error) {
      // If the token is invalid or expired, send a 403 Forbidden error
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Store the user info in the request object for use in the next middleware
    req.user = info;
    console.log(info);

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = { verify };
