/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

/**
 * Error handler middleware
 * Handles all errors and sends consistent JSON responses
 */
const errorHandler = (err, req, res, next) => {
    // Set status code from error or default to 500
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = { errorHandler, notFound };
