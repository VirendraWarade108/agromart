"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpdateAdminStatus = exports.getUserActivity = exports.getUserStats = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const adminUserService = __importStar(require("../services/adminUserService"));
// ============================================
// ADMIN USER MANAGEMENT
// ============================================
/**
 * Get all users
 * GET /api/admin/users
 */
exports.getAllUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isAdmin, search, page, limit } = req.query;
    const result = await adminUserService.getAllUsers({
        isAdmin: isAdmin === 'true' ? true : isAdmin === 'false' ? false : undefined,
        search: search,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
    });
});
/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
exports.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await adminUserService.getUserById(id);
    res.json({
        success: true,
        data: user,
    });
});
/**
 * Create user
 * POST /api/admin/users
 */
exports.createUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, fullName, phone, isAdmin } = req.body;
    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
        });
    }
    const user = await adminUserService.createUser({
        email,
        password,
        fullName,
        phone,
        isAdmin,
    });
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
    });
});
/**
 * Update user
 * PUT /api/admin/users/:id
 */
exports.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { email, password, fullName, phone, isAdmin } = req.body;
    const user = await adminUserService.updateUser(id, {
        email,
        password,
        fullName,
        phone,
        isAdmin,
    });
    res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
    });
});
/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await adminUserService.deleteUser(id);
    res.json({
        success: true,
        message: result.message,
    });
});
/**
 * Get user statistics
 * GET /api/admin/users/stats
 */
exports.getUserStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await adminUserService.getUserStats();
    res.json({
        success: true,
        data: stats,
    });
});
/**
 * Get user activity
 * GET /api/admin/users/:id/activity
 */
exports.getUserActivity = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const activity = await adminUserService.getUserActivity(id);
    res.json({
        success: true,
        data: activity,
    });
});
/**
 * Bulk update admin status
 * PUT /api/admin/users/bulk-admin
 */
exports.bulkUpdateAdminStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            success: false,
            message: 'Updates array is required',
        });
    }
    const result = await adminUserService.bulkUpdateAdminStatus(updates);
    res.json({
        success: true,
        message: `Bulk update completed. ${result.succeeded} succeeded, ${result.failed} failed.`,
        data: result,
    });
});
