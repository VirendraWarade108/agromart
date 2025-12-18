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
exports.logout = exports.updateProfile = exports.getProfile = exports.refresh = exports.login = exports.register = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const authService = __importStar(require("../services/authService"));
/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { fullName, email, phone, password } = req.body;
    const result = await authService.registerUser({
        fullName,
        email,
        phone,
        password,
    });
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
    });
});
/**
 * Login user
 * POST /api/auth/login
 */
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({
        success: true,
        message: 'Login successful',
        data: result,
    });
});
/**
 * Refresh access token
 * POST /api/auth/refresh
 */
exports.refresh = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json({
        success: true,
        data: tokens,
    });
});
/**
 * Get current user profile
 * GET /api/auth/profile
 */
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // userId comes from auth middleware (set after verifying token)
    const userId = req.userId;
    const user = await authService.getUserProfile(userId);
    res.json({
        success: true,
        data: user,
    });
});
/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { fullName, phone } = req.body;
    const user = await authService.updateUserProfile(userId, {
        fullName,
        phone,
    });
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});
/**
 * Logout (client-side token removal, no backend action needed)
 * POST /api/auth/logout
 */
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // Client should remove tokens from localStorage
    res.json({
        success: true,
        message: 'Logout successful',
    });
});
