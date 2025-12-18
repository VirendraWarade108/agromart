"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const env_1 = require("../config/env");
/**
 * Custom error class with status code
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Errors we expect and handle
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Error handler middleware
 *
 * Catches all errors thrown in controllers/routes
 * Sends consistent error response to frontend
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 server error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Prisma errors
    if (err.code === 'P2002') {
        // Unique constraint violation
        statusCode = 400;
        message = 'This record already exists';
    }
    else if (err.code === 'P2025') {
        // Record not found
        statusCode = 404;
        message = 'Record not found';
    }
    // Validation errors (express-validator)
    if (err.array && typeof err.array === 'function') {
        statusCode = 400;
        const errors = err.array();
        message = errors.map((e) => e.msg).join(', ');
    }
    // Log error in development
    if (env_1.env.isDevelopment) {
        console.error('❌ Error:', err);
    }
    // Send response
    res.status(statusCode).json({
        success: false,
        message,
        ...(env_1.env.isDevelopment && { stack: err.stack }), // Only in dev
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Async handler wrapper
 * Catches errors in async route handlers
 *
 * Usage:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   // Your async code here
 * }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
