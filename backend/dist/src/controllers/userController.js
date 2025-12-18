"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderHistory = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const database_1 = __importDefault(require("../config/database"));
const errorHandler_2 = require("../middleware/errorHandler");
const bcrypt_1 = require("../utils/bcrypt");
/**
 * Get user profile
 * GET /api/users/profile
 */
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
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
        throw new errorHandler_2.AppError('User not found', 404);
    }
    res.json({
        success: true,
        data: user,
    });
});
/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { fullName, phone, email } = req.body;
    // Build update data
    const updateData = {};
    if (fullName !== undefined)
        updateData.fullName = fullName;
    if (phone !== undefined)
        updateData.phone = phone;
    if (email !== undefined) {
        // Check if email is already taken by another user
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser && existingUser.id !== userId) {
            throw new errorHandler_2.AppError('Email already in use', 400);
        }
        updateData.email = email;
    }
    const user = await database_1.default.user.update({
        where: { id: userId },
        data: updateData,
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
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});
/**
 * Change password
 * PUT /api/users/password
 */
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    // Validate required fields
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password and new password are required',
        });
    }
    // Validate new password length
    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters',
        });
    }
    // Get user with password
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new errorHandler_2.AppError('User not found', 404);
    }
    // Verify current password
    const isPasswordValid = await (0, bcrypt_1.comparePassword)(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new errorHandler_2.AppError('Current password is incorrect', 401);
    }
    // Hash new password
    const hashedPassword = await (0, bcrypt_1.hashPassword)(newPassword);
    // Update password
    await database_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
});
/**
 * Get user's order history
 * GET /api/users/orders
 */
exports.getOrderHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const orders = await database_1.default.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            image: true,
                            price: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json({
        success: true,
        data: orders,
    });
});
