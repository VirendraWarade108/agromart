"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateAdminStatus = exports.getUserActivity = exports.getUserStats = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Get all users (Admin)
 */
const getAllUsers = async (filters) => {
    const { isAdmin, search, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;
    // Build where clause
    const where = {};
    if (isAdmin !== undefined)
        where.isAdmin = isAdmin;
    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [users, total] = await Promise.all([
        database_1.default.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                        wishlist: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.user.count({ where }),
    ]);
    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllUsers = getAllUsers;
/**
 * Get user by ID (Admin)
 */
const getUserById = async (userId) => {
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
            addresses: true,
            _count: {
                select: {
                    orders: true,
                    reviews: true,
                    wishlist: true,
                },
            },
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    return user;
};
exports.getUserById = getUserById;
/**
 * Create user (Admin)
 */
const createUser = async (userData) => {
    // Check if user already exists
    const existingUser = await database_1.default.user.findUnique({
        where: { email: userData.email },
    });
    if (existingUser) {
        throw new errorHandler_1.AppError('User with this email already exists', 400);
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
    // Create user
    const user = await database_1.default.user.create({
        data: {
            email: userData.email,
            password: hashedPassword,
            fullName: userData.fullName || '',
            phone: userData.phone,
            isAdmin: userData.isAdmin || false,
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
    return user;
};
exports.createUser = createUser;
/**
 * Update user (Admin)
 */
const updateUser = async (userId, updateData) => {
    // Check if user exists
    const existingUser = await database_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!existingUser) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
        const emailConflict = await database_1.default.user.findUnique({
            where: { email: updateData.email },
        });
        if (emailConflict) {
            throw new errorHandler_1.AppError('Email already in use', 400);
        }
    }
    // Prepare update data
    const dataToUpdate = {};
    if (updateData.email)
        dataToUpdate.email = updateData.email;
    if (updateData.fullName !== undefined)
        dataToUpdate.fullName = updateData.fullName;
    if (updateData.phone !== undefined)
        dataToUpdate.phone = updateData.phone;
    if (updateData.isAdmin !== undefined)
        dataToUpdate.isAdmin = updateData.isAdmin;
    if (updateData.password) {
        dataToUpdate.password = await bcryptjs_1.default.hash(updateData.password, 10);
    }
    // Update user
    const updatedUser = await database_1.default.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isAdmin: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
exports.updateUser = updateUser;
/**
 * Delete user (Admin)
 */
const deleteUser = async (userId) => {
    // Check if user exists
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    orders: true,
                },
            },
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Prevent deleting admin users (optional safety check)
    if (user.isAdmin) {
        throw new errorHandler_1.AppError('Cannot delete admin users', 403);
    }
    // Check if user has orders
    if (user._count.orders > 0) {
        throw new errorHandler_1.AppError('Cannot delete user with existing orders. Consider deactivating instead.', 400);
    }
    // Delete user (cascade will delete related data)
    await database_1.default.user.delete({
        where: { id: userId },
    });
    return { message: 'User deleted successfully' };
};
exports.deleteUser = deleteUser;
/**
 * Get user statistics (Admin)
 */
const getUserStats = async () => {
    const [totalUsers, adminUsers, regularUsers, usersThisMonth] = await Promise.all([
        database_1.default.user.count(),
        database_1.default.user.count({ where: { isAdmin: true } }),
        database_1.default.user.count({ where: { isAdmin: false } }),
        database_1.default.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(1)), // First day of current month
                },
            },
        }),
    ]);
    return {
        totalUsers,
        adminUsers,
        regularUsers,
        usersThisMonth,
    };
};
exports.getUserStats = getUserStats;
/**
 * Get user activity (Admin)
 */
const getUserActivity = async (userId) => {
    const user = await database_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const [orders, reviews, wishlistCount] = await Promise.all([
        database_1.default.order.findMany({
            where: { userId },
            select: {
                id: true,
                total: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        database_1.default.review.findMany({
            where: { userId },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        database_1.default.wishlist.count({ where: { userId } }),
    ]);
    return {
        recentOrders: orders,
        recentReviews: reviews,
        wishlistCount,
    };
};
exports.getUserActivity = getUserActivity;
/**
 * Bulk update admin status (Admin)
 */
const bulkUpdateAdminStatus = async (updates) => {
    const results = await Promise.all(updates.map(async (update) => {
        try {
            const user = await database_1.default.user.update({
                where: { id: update.userId },
                data: { isAdmin: update.isAdmin },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    isAdmin: true,
                },
            });
            return { success: true, user };
        }
        catch (error) {
            return {
                success: false,
                userId: update.userId,
                error: 'User not found or update failed',
            };
        }
    }));
    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    return {
        total: updates.length,
        succeeded: succeeded.length,
        failed: failed.length,
        results,
    };
};
exports.bulkUpdateAdminStatus = bulkUpdateAdminStatus;
