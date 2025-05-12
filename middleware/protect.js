    const jwt = require('jsonwebtoken');
    const User = require('../model/User');

    const protect = async (req, res, next) => {  // Add 'next' here
        let token;


        // Check if auth header exists
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            try {
                token = req.headers.authorization.split(" ")[1]; // Extract the token
                const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
                req.user = await User.findById(decoded.id).select("password");

                next();  // Call next() to move to the next middleware or route handler
            } catch (error) {
                console.error("Auth error:", error);
                return res.status(401).json({ message: "Not authorized, token failed" });
            }
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
    }

    module.exports = { protect };
