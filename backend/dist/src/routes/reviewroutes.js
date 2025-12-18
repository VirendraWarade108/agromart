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
const reviewController = __importStar(require("../controllers/reviewcontroller"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
/**
 * Get product reviews
 * GET /api/products/:productId/reviews
 */
router.get('/products/:productId/reviews', reviewController.getProductReviews);
/**
 * Get product review statistics
 * GET /api/products/:productId/reviews/stats
 */
router.get('/products/:productId/reviews/stats', reviewController.getProductReviewStats);
// ============================================
// USER ROUTES (Authentication required)
// ============================================
/**
 * Get my reviews
 * GET /api/reviews/my-reviews
 * Note: Must come before /:id to avoid route conflicts
 */
router.get('/my-reviews', auth_1.authenticate, reviewController.getMyReviews);
/**
 * Create a review (primary endpoint)
 * POST /api/reviews
 */
router.post('/', auth_1.authenticate, reviewController.createReview);
/**
 * Create a review for a specific product (frontend compatibility alias)
 * POST /api/products/:productId/reviews
 */
router.post('/products/:productId/reviews', auth_1.authenticate, reviewController.createProductReview);
/**
 * Update a review
 * PUT /api/reviews/:id
 */
router.put('/:id', auth_1.authenticate, reviewController.updateReview);
/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
router.delete('/:id', auth_1.authenticate, reviewController.deleteReview);
/**
 * Mark review as helpful
 * POST /api/reviews/:id/helpful
 */
router.post('/:id/helpful', reviewController.markReviewHelpful);
// ============================================
// ADMIN ROUTES
// ============================================
/**
 * Get all reviews
 * GET /api/admin/reviews
 */
router.get('/admin', auth_1.authenticate, auth_1.requireAdmin, reviewController.getAllReviews);
/**
 * Delete review
 * DELETE /api/admin/reviews/:id
 */
router.delete('/admin/:id', auth_1.authenticate, auth_1.requireAdmin, reviewController.deleteReviewAdmin);
exports.default = router;
