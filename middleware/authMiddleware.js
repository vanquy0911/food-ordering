const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 * Auth Middleware
 * Handles JWT token verification and user authentication
 */

/**
 * Protect routes - verify JWT token
 * Attaches authenticated user to req.user
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if authorization header exists and starts with 'Bearer'
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // Get token from header (format: "Bearer TOKEN")
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                const error = new Error("Not authorized, user not found");
                error.statusCode = 401;
                throw error;
            }

            next();
        } else {
            const error = new Error("Not authorized, no token provided");
            error.statusCode = 401;
            throw error;
        }
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            error.message = "Not authorized, invalid token";
            error.statusCode = 401;
        } else if (error.name === "TokenExpiredError") {
            error.message = "Not authorized, token expired";
            error.statusCode = 401;
        }
        next(error);
    }
};

/**
 * Admin only middleware
 * Must be used after protect middleware
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        const error = new Error("Not authorized as admin");
        error.statusCode = 403;
        next(error);
    }
};

module.exports = { protect, admin };
