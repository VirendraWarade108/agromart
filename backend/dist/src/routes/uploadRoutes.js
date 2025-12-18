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
const uploadController = __importStar(require("../controllers/uploadController"));
const auth_1 = require("../middleware/auth");
const uploadService_1 = require("../services/uploadService");
const router = (0, express_1.Router)();
// ============================================
// GENERIC IMAGE UPLOADS (Frontend compatibility)
// Routes must come BEFORE specific routes to avoid conflicts
// ============================================
/**
 * Upload single image (generic endpoint for frontend)
 * POST /api/upload/image
 * Accepts optional 'folder' in FormData to specify destination
 */
router.post('/image', auth_1.authenticate, // Require auth, but not admin
uploadService_1.upload.single('image'), uploadController.uploadImage);
/**
 * Upload multiple images (generic endpoint for frontend)
 * POST /api/upload/multiple
 * Accepts optional 'folder' in FormData to specify destination
 */
router.post('/multiple', auth_1.authenticate, // Require auth, but not admin
uploadService_1.upload.array('images', 10), // Max 10 images
uploadController.uploadMultipleImages);
// ============================================
// PRODUCT IMAGE UPLOADS (Admin only)
// ============================================
/**
 * Upload single product image
 * POST /api/upload/product
 */
router.post('/product', auth_1.authenticate, auth_1.requireAdmin, uploadService_1.upload.single('image'), uploadController.uploadProductImage);
/**
 * Upload multiple product images
 * POST /api/upload/products
 */
router.post('/products', auth_1.authenticate, auth_1.requireAdmin, uploadService_1.upload.array('images', 10), // Max 10 images
uploadController.uploadProductImages);
// ============================================
// REVIEW IMAGE UPLOADS (Authenticated users)
// ============================================
/**
 * Upload single review image
 * POST /api/upload/review
 */
router.post('/review', auth_1.authenticate, uploadService_1.upload.single('image'), uploadController.uploadReviewImage);
/**
 * Upload multiple review images
 * POST /api/upload/reviews
 */
router.post('/reviews', auth_1.authenticate, uploadService_1.upload.array('images', 5), // Max 5 images
uploadController.uploadReviewImages);
// ============================================
// PROFILE IMAGE UPLOAD (Authenticated users)
// ============================================
/**
 * Upload profile image
 * POST /api/upload/profile
 */
router.post('/profile', auth_1.authenticate, uploadService_1.upload.single('image'), uploadController.uploadProfileImage);
// ============================================
// DELETE IMAGE
// ============================================
/**
 * Delete image
 * DELETE /api/upload/:type/:filename
 */
router.delete('/:type/:filename', auth_1.authenticate, uploadController.deleteImage);
// ============================================
// ADMIN ROUTES
// ============================================
/**
 * Get upload statistics
 * GET /api/admin/upload/stats
 */
router.get('/admin/stats', auth_1.authenticate, auth_1.requireAdmin, uploadController.getUploadStats);
/**
 * Clean up old files
 * POST /api/admin/upload/cleanup
 */
router.post('/admin/cleanup', auth_1.authenticate, auth_1.requireAdmin, uploadController.cleanupOldFiles);
exports.default = router;
