"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jwt = require('jsonwebtoken');
const env_1 = require("../config/env");
/**
 * Generate access token (short-lived)
 * Used for API requests
 *
 * @param payload - User data to store in token
 * @returns JWT access token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate refresh token (long-lived)
 * Used to get new access token when it expires
 *
 * @param payload - User data to store in token
 * @returns JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Generate both access and refresh tokens
 *
 * @param payload - User data
 * @returns Object with both tokens
 */
const generateTokenPair = (payload) => {
    return {
        accessToken: (0, exports.generateAccessToken)(payload),
        refreshToken: (0, exports.generateRefreshToken)(payload),
    };
};
exports.generateTokenPair = generateTokenPair;
/**
 * Verify access token
 *
 * @param token - JWT token from request header
 * @returns Decoded payload if valid
 * @throws Error if token invalid or expired
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env_1.env.JWT_SECRET);
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        throw new Error('Invalid token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify refresh token
 *
 * @param token - JWT refresh token
 * @returns Decoded payload if valid
 * @throws Error if token invalid or expired
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, env_1.env.JWT_REFRESH_SECRET);
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expired');
        }
        throw new Error('Invalid refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
