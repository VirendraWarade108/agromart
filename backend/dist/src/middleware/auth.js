"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("./errorHandler");
/**
 * Authentication middleware
 *
 * Verifies JWT token and adds user info to request
 * Use this on protected routes
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer '
        // Verify token
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Add user info to request
        req.userId = payload.userId;
        req.userEmail = payload.email;
        req.isAdmin = payload.isAdmin;
        // Continue to next middleware/controller
        next();
    }
    catch (error) {
        if (error.message === 'Token expired') {
            return next(new errorHandler_1.AppError('Token expired', 401));
        }
        next(new errorHandler_1.AppError('Invalid token', 401));
    }
};
exports.authenticate = authenticate;
/**
 * Admin-only middleware
 *
 * Requires user to be authenticated AND be an admin
 * Use this on admin routes
 */
const requireAdmin = (req, res, next) => {
    if (!req.isAdmin) {
        return next(new errorHandler_1.AppError('Admin access required', 403));
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Optional authentication middleware
 *
 * Adds user info if token is provided, but doesn't require it
 * Useful for routes that work with or without login
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = (0, jwt_1.verifyAccessToken)(token);
            req.userId = payload.userId;
            req.userEmail = payload.email;
            req.isAdmin = payload.isAdmin;
        }
    }
    catch (error) {
        // Token invalid, but continue anyway (optional auth)
    }
    next();
};
exports.optionalAuth = optionalAuth;
