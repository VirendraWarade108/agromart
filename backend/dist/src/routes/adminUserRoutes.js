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
const express_1 = require("express");
const adminUserController = __importStar(require("../controllers/adminUserController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate, auth_1.requireAdmin);
// ============================================
// USER STATISTICS (Must come before /:id routes)
// ============================================
/**
 * Get user statistics
 * GET /api/admin/users/stats
 */
router.get('/stats', adminUserController.getUserStats);
/**
 * Bulk update admin status
 * PUT /api/admin/users/bulk-admin
 */
router.put('/bulk-admin', adminUserController.bulkUpdateAdminStatus);
// ============================================
// USER CRUD
// ============================================
/**
 * Get all users
 * GET /api/admin/users
 */
router.get('/', adminUserController.getAllUsers);
/**
 * Create user
 * POST /api/admin/users
 */
router.post('/', adminUserController.createUser);
/**
 * Get user by ID
 * GET /api/admin/users/:id
 */
router.get('/:id', adminUserController.getUserById);
/**
 * Update user
 * PUT /api/admin/users/:id
 */
router.put('/:id', adminUserController.updateUser);
/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
router.delete('/:id', adminUserController.deleteUser);
/**
 * Get user activity
 * GET /api/admin/users/:id/activity
 */
router.get('/:id/activity', adminUserController.getUserActivity);
exports.default = router;
