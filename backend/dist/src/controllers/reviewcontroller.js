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
exports.deleteReviewAdmin = exports.getAllReviews = exports.getMyReviews = exports.markReviewHelpful = exports.deleteReview = exports.updateReview = exports.createProductReview = exports.createReview = exports.getProductReviewStats = exports.getProductReviews = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const reviewService = __importStar(require("../services/reviewService"));
// ============================================
// PUBLIC REVIEW ENDPOINTS
// ============================================
/**
 * Get product reviews
 * GET /api/products/:productId/reviews
 */
exports.getProductReviews = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const { rating, page, limit, sortBy } = req.query;
    const result = await reviewService.getProductReviews(productId, {
        rating: rating ? parseInt(rating) : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        sortBy: sortBy,
    });
    res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
    });
});
/**
 * Get product review statistics
 * GET /api/products/:productId/reviews/stats
 */
exports.getProductReviewStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const stats = await reviewService.getProductReviewStats(productId);
    res.json({
        success: true,
        data: stats,
    });
});
// ============================================
// USER REVIEW ENDPOINTS (Authenticated)
// ============================================
/**
 * Create a review
 * POST /api/reviews
 */
exports.createReview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productId, rating, title, comment, images } = req.body;
    // Validate required fields
    if (!productId || !rating || !comment) {
        return res.status(400).json({
            success: false,
            message: 'Product ID, rating, and comment are required',
        });
    }
    const review = await reviewService.createReview({
        userId,
        productId,
        rating: parseInt(rating),
        title,
        comment,
        images,
    });
    res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
    });
});
/**
 * Create a review for a specific product (frontend compatibility)
 * POST /api/products/:productId/reviews
 */
exports.createProductReview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params; // Extract from URL params
    const { rating, title, comment, images } = req.body;
    // Validate required fields
    if (!rating || !comment) {
        return res.status(400).json({
            success: false,
            message: 'Rating and comment are required',
        });
    }
    const review = await reviewService.createReview({
        userId,
        productId,
        rating: parseInt(rating),
        title,
        comment,
        images,
    });
    res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
    });
});
/**
 * Update a review
 * PUT /api/reviews/:id
 */
exports.updateReview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const review = await reviewService.updateReview(id, userId, {
        rating: rating ? parseInt(rating) : undefined,
        title,
        comment,
        images,
    });
    res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
    });
});
/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
exports.deleteReview = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const result = await reviewService.deleteReview(id, userId);
    res.json({
        success: true,
        message: result.message,
    });
});
/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
exports.markReviewHelpful = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const review = await reviewService.markReviewHelpful(id);
    res.json({
        success: true,
        message: 'Review marked as helpful',
        data: {
            helpfulCount: review.helpfulCount,
        },
    });
});
/**
 * Get user's reviews
 * GET /api/reviews/my-reviews
 */
exports.getMyReviews = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const reviews = await reviewService.getUserReviews(userId);
    res.json({
        success: true,
        count: reviews.length,
        data: reviews,
    });
});
// ============================================
// ADMIN REVIEW ENDPOINTS
// ============================================
/**
 * Get all reviews (Admin)
 * GET /api/admin/reviews
 */
exports.getAllReviews = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { productId, userId, rating, page, limit } = req.query;
    const result = await reviewService.getAllReviews({
        productId: productId,
        userId: userId,
        rating: rating ? parseInt(rating) : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
    });
    res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
    });
});
/**
 * Delete review (Admin)
 * DELETE /api/admin/reviews/:id
 */
exports.deleteReviewAdmin = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await reviewService.deleteReviewAdmin(id);
    res.json({
        success: true,
        message: result.message,
    });
});
