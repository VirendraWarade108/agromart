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
exports.cleanupOldFiles = exports.getUploadStats = exports.deleteImage = exports.uploadProfileImage = exports.uploadReviewImages = exports.uploadReviewImage = exports.uploadProductImages = exports.uploadProductImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const uploadService = __importStar(require("../services/uploadService"));
// ============================================
// GENERIC IMAGE UPLOADS (Frontend compatibility)
// ============================================
/**
 * Upload single image (generic endpoint)
 * POST /api/upload/image
 * Supports folder parameter to specify destination
 */
exports.uploadImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }
    // Allow folder to be specified via body or default to 'products'
    const folder = req.body.folder || 'products';
    // Validate folder
    const validFolders = ['products', 'reviews', 'profiles'];
    if (!validFolders.includes(folder)) {
        return res.status(400).json({
            success: false,
            message: `Invalid folder. Must be one of: ${validFolders.join(', ')}`,
        });
    }
    const result = await uploadService.uploadSingleImage(req.file, folder);
    res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
    });
});
/**
 * Upload multiple images (generic endpoint)
 * POST /api/upload/multiple
 * Supports folder parameter to specify destination
 */
exports.uploadMultipleImages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded',
        });
    }
    // Allow folder to be specified via body or default to 'products'
    const folder = req.body.folder || 'products';
    // Validate folder
    const validFolders = ['products', 'reviews', 'profiles'];
    if (!validFolders.includes(folder)) {
        return res.status(400).json({
            success: false,
            message: `Invalid folder. Must be one of: ${validFolders.join(', ')}`,
        });
    }
    const result = await uploadService.uploadMultipleImages(req.files, folder);
    res.status(201).json({
        success: true,
        message: `${result.length} images uploaded successfully`,
        data: result,
    });
});
// ============================================
// PRODUCT IMAGE UPLOADS (Admin only)
// ============================================
/**
 * Upload single product image
 * POST /api/upload/product
 */
exports.uploadProductImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }
    const result = await uploadService.uploadSingleImage(req.file, 'products');
    res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
    });
});
/**
 * Upload multiple product images
 * POST /api/upload/products
 */
exports.uploadProductImages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded',
        });
    }
    const result = await uploadService.uploadMultipleImages(req.files, 'products');
    res.status(201).json({
        success: true,
        message: `${result.length} images uploaded successfully`,
        data: result,
    });
});
// ============================================
// REVIEW IMAGE UPLOADS (Authenticated users)
// ============================================
/**
 * Upload single review image
 * POST /api/upload/review
 */
exports.uploadReviewImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }
    const result = await uploadService.uploadSingleImage(req.file, 'reviews');
    res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
    });
});
/**
 * Upload multiple review images
 * POST /api/upload/reviews
 */
exports.uploadReviewImages = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded',
        });
    }
    const result = await uploadService.uploadMultipleImages(req.files, 'reviews');
    res.status(201).json({
        success: true,
        message: `${result.length} images uploaded successfully`,
        data: result,
    });
});
// ============================================
// PROFILE IMAGE UPLOAD (Authenticated users)
// ============================================
/**
 * Upload profile image
 * POST /api/upload/profile
 */
exports.uploadProfileImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }
    const result = await uploadService.uploadSingleImage(req.file, 'profiles');
    res.status(201).json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: result,
    });
});
// ============================================
// DELETE IMAGE
// ============================================
/**
 * Delete image
 * DELETE /api/upload/:type/:filename
 */
exports.deleteImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { type, filename } = req.params;
    // Validate type
    if (!['products', 'reviews', 'profiles'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid image type',
        });
    }
    await uploadService.deleteFile(filename, type);
    res.json({
        success: true,
        message: 'Image deleted successfully',
    });
});
// ============================================
// ADMIN ROUTES
// ============================================
/**
 * Get upload statistics
 * GET /api/admin/upload/stats
 */
exports.getUploadStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await uploadService.getUploadStats();
    res.json({
        success: true,
        data: stats,
    });
});
/**
 * Clean up old files
 * POST /api/admin/upload/cleanup
 */
exports.cleanupOldFiles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { daysOld = 30 } = req.body;
    const deletedCount = await uploadService.cleanupOldFiles(daysOld);
    res.json({
        success: true,
        message: `Cleaned up ${deletedCount} old files`,
        data: { deletedCount },
    });
});
