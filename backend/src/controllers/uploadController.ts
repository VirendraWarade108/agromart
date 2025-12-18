import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as uploadService from '../services/uploadService';

// ============================================
// PRODUCT IMAGE UPLOADS (Admin only)
// ============================================

/**
 * Upload single product image
 * POST /api/upload/product
 */
export const uploadProductImage = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Upload multiple product images
 * POST /api/upload/products
 */
export const uploadProductImages = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

// ============================================
// REVIEW IMAGE UPLOADS (Authenticated users)
// ============================================

/**
 * Upload single review image
 * POST /api/upload/review
 */
export const uploadReviewImage = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

/**
 * Upload multiple review images
 * POST /api/upload/reviews
 */
export const uploadReviewImages = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

// ============================================
// PROFILE IMAGE UPLOAD (Authenticated users)
// ============================================

/**
 * Upload profile image
 * POST /api/upload/profile
 */
export const uploadProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

// ============================================
// DELETE IMAGE
// ============================================

/**
 * Delete image
 * DELETE /api/upload/:type/:filename
 */
export const deleteImage = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, filename } = req.params;

    // Validate type
    if (!['products', 'reviews', 'profiles'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type',
      });
    }

    await uploadService.deleteFile(filename, type as 'products' | 'reviews' | 'profiles');

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  }
);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * Get upload statistics
 * GET /api/admin/upload/stats
 */
export const getUploadStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await uploadService.getUploadStats();

    res.json({
      success: true,
      data: stats,
    });
  }
);

/**
 * Clean up old files
 * POST /api/admin/upload/cleanup
 */
export const cleanupOldFiles = asyncHandler(
  async (req: Request, res: Response) => {
    const { daysOld = 30 } = req.body;

    const deletedCount = await uploadService.cleanupOldFiles(daysOld);

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old files`,
      data: { deletedCount },
    });
  }
);