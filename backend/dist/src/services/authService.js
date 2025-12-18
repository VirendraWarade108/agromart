"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Register new user
 */
const registerUser = async (data) => {
    // Check if user already exists
    const existingUser = await database_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new errorHandler_1.AppError('User with this email already exists', 400);
    }
    // Hash password
    const hashedPassword = await (0, bcrypt_1.hashPassword)(data.password);
    // Create user
    const user = await database_1.default.user.create({
        data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isAdmin: true,
            createdAt: true,
        },
    });
    // Create empty cart for user
    await database_1.default.cart.create({
        data: {
            userId: user.id,
        },
    });
    // Generate tokens
    const tokens = (0, jwt_1.generateTokenPair)({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
    });
    return {
        user,
        ...tokens,
    };
};
exports.registerUser = registerUser;
/**
 * Login user
 */
const loginUser = async (email, password) => {
    // Find user by email
    const user = await database_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new errorHandler_1.AppError('Invalid email or password', 401);
    }
    // Check password
    const isPasswordValid = await (0, bcrypt_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_1.AppError('Invalid email or password', 401);
    }
    // Generate tokens
    const tokens = (0, jwt_1.generateTokenPair)({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
    });
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        ...tokens,
    };
};
exports.loginUser = loginUser;
/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
    // Verify refresh token
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch (error) {
        throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
    }
    // Check if user still exists
    const user = await database_1.default.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Generate new tokens
    const tokens = (0, jwt_1.generateTokenPair)({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
    });
    return tokens;
};
exports.refreshAccessToken = refreshAccessToken;
/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    return user;
};
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 */
const updateUserProfile = async (userId, data) => {
    const user = await database_1.default.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
exports.updateUserProfile = updateUserProfile;
