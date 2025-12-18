"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewAdmin = exports.getAllReviews = exports.getUserReviews = exports.markReviewHelpful = exports.deleteReview = exports.updateReview = exports.createReview = exports.getProductReviewStats = exports.getProductReviews = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get product reviews
 */
const getProductReviews = async (productId, filters) => {
    const { rating, page = 1, limit = 10, sortBy = 'recent' } = filters || {};
    const skip = (page - 1) * limit;
    // Build where clause
    const where = { productId };
    if (rating)
        where.rating = rating;
    // Build orderBy
    let orderBy = { createdAt: 'desc' }; // default
    if (sortBy === 'helpful')
        orderBy = { helpfulCount: 'desc' };
    if (sortBy === 'rating_high')
        orderBy = { rating: 'desc' };
    if (sortBy === 'rating_low')
        orderBy = { rating: 'asc' };
    const [reviews, total] = await Promise.all([
        database_1.default.review.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        }),
        database_1.default.review.count({ where }),
    ]);
    return {
        reviews,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getProductReviews = getProductReviews;
/**
 * Get review statistics for a product
 */
const getProductReviewStats = async (productId) => {
    const [totalReviews, avgRating, ratingDistribution] = await Promise.all([
        database_1.default.review.count({ where: { productId } }),
        database_1.default.review.aggregate({
            where: { productId },
            _avg: { rating: true },
        }),
        database_1.default.review.groupBy({
            by: ['rating'],
            where: { productId },
            _count: { rating: true },
        }),
    ]);
    // Format rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
        distribution[item.rating] = item._count.rating;
    });
    return {
        totalReviews,
        averageRating: avgRating._avg.rating || 0,
        ratingDistribution: distribution,
    };
};
exports.getProductReviewStats = getProductReviewStats;
/**
 * Create a review
 */
const createReview = async (reviewData) => {
    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new errorHandler_1.AppError('Rating must be between 1 and 5', 400);
    }
    // Check if product exists
    const product = await database_1.default.product.findUnique({
        where: { id: reviewData.productId },
    });
    if (!product) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    // Check if user already reviewed this product
    const existingReview = await database_1.default.review.findUnique({
        where: {
            userId_productId: {
                userId: reviewData.userId,
                productId: reviewData.productId,
            },
        },
    });
    if (existingReview) {
        throw new errorHandler_1.AppError('You have already reviewed this product', 400);
    }
    // Check if user purchased this product (verified purchase)
    const hasPurchased = await database_1.default.orderItem.findFirst({
        where: {
            productId: reviewData.productId,
            order: {
                userId: reviewData.userId,
                status: 'delivered', // Only delivered orders count
            },
        },
    });
    // Create review
    const review = await database_1.default.review.create({
        data: {
            userId: reviewData.userId,
            productId: reviewData.productId,
            rating: reviewData.rating,
            title: reviewData.title,
            comment: reviewData.comment,
            images: reviewData.images ? reviewData.images : null,
            isVerifiedPurchase: !!hasPurchased,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });
    // Update product rating and review count
    await updateProductRating(reviewData.productId);
    return review;
};
exports.createReview = createReview;
/**
 * Update a review
 */
const updateReview = async (reviewId, userId, updateData) => {
    // Check if review exists and belongs to user
    const existingReview = await database_1.default.review.findUnique({
        where: { id: reviewId },
    });
    if (!existingReview) {
        throw new errorHandler_1.AppError('Review not found', 404);
    }
    if (existingReview.userId !== userId) {
        throw new errorHandler_1.AppError('You can only update your own reviews', 403);
    }
    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        throw new errorHandler_1.AppError('Rating must be between 1 and 5', 400);
    }
    // Prepare update data
    const dataToUpdate = {};
    if (updateData.rating !== undefined)
        dataToUpdate.rating = updateData.rating;
    if (updateData.title !== undefined)
        dataToUpdate.title = updateData.title;
    if (updateData.comment !== undefined)
        dataToUpdate.comment = updateData.comment;
    if (updateData.images !== undefined)
        dataToUpdate.images = updateData.images;
    // Update review
    const updatedReview = await database_1.default.review.update({
        where: { id: reviewId },
        data: dataToUpdate,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });
    // Update product rating
    await updateProductRating(existingReview.productId);
    return updatedReview;
};
exports.updateReview = updateReview;
/**
 * Delete a review
 */
const deleteReview = async (reviewId, userId) => {
    // Check if review exists and belongs to user
    const review = await database_1.default.review.findUnique({
        where: { id: reviewId },
    });
    if (!review) {
        throw new errorHandler_1.AppError('Review not found', 404);
    }
    if (review.userId !== userId) {
        throw new errorHandler_1.AppError('You can only delete your own reviews', 403);
    }
    const productId = review.productId;
    // Delete review
    await database_1.default.review.delete({
        where: { id: reviewId },
    });
    // Update product rating
    await updateProductRating(productId);
    return { message: 'Review deleted successfully' };
};
exports.deleteReview = deleteReview;
/**
 * Mark review as helpful
 */
const markReviewHelpful = async (reviewId) => {
    const review = await database_1.default.review.findUnique({
        where: { id: reviewId },
    });
    if (!review) {
        throw new errorHandler_1.AppError('Review not found', 404);
    }
    // Increment helpful count
    const updatedReview = await database_1.default.review.update({
        where: { id: reviewId },
        data: {
            helpfulCount: {
                increment: 1,
            },
        },
    });
    return updatedReview;
};
exports.markReviewHelpful = markReviewHelpful;
/**
 * Get user's reviews
 */
const getUserReviews = async (userId) => {
    const reviews = await database_1.default.review.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    price: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return reviews;
};
exports.getUserReviews = getUserReviews;
/**
 * Helper: Update product rating and review count
 * UPDATED: Uses 'reviewCount' instead of 'reviews'
 */
const updateProductRating = async (productId) => {
    const stats = await database_1.default.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
    });
    await database_1.default.product.update({
        where: { id: productId },
        data: {
            rating: stats._avg.rating || null,
            reviewCount: stats._count.rating || 0, // ← CHANGED from 'reviews' to 'reviewCount'
        },
    });
};
/**
 * Get all reviews (Admin)
 */
const getAllReviews = async (filters) => {
    const { productId, userId, rating, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (productId)
        where.productId = productId;
    if (userId)
        where.userId = userId;
    if (rating)
        where.rating = rating;
    const [reviews, total] = await Promise.all([
        database_1.default.review.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.review.count({ where }),
    ]);
    return {
        reviews,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getAllReviews = getAllReviews;
/**
 * Delete review (Admin)
 */
const deleteReviewAdmin = async (reviewId) => {
    const review = await database_1.default.review.findUnique({
        where: { id: reviewId },
    });
    if (!review) {
        throw new errorHandler_1.AppError('Review not found', 404);
    }
    const productId = review.productId;
    await database_1.default.review.delete({
        where: { id: reviewId },
    });
    // Update product rating
    await updateProductRating(productId);
    return { message: 'Review deleted successfully' };
};
exports.deleteReviewAdmin = deleteReviewAdmin;
