import { Router } from 'express';
import * as wishlistController from '../controllers/WishlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// WISHLIST ROUTES
// ============================================

/**
 * Get wishlist count
 * GET /api/wishlist/count
 * Note: Must come before /:productId to avoid route conflicts
 */
router.get('/count', wishlistController.getWishlistCount);

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
router.get('/check/:productId', wishlistController.checkWishlist);

/**
 * Move items to cart
 * POST /api/wishlist/move-to-cart
 */
router.post('/move-to-cart', wishlistController.moveToCart);

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
router.get('/', wishlistController.getWishlist);

/**
 * Add product to wishlist
 * POST /api/wishlist
 */
router.post('/', wishlistController.addToWishlist);

/**
 * Clear entire wishlist
 * DELETE /api/wishlist
 */
router.delete('/', wishlistController.clearWishlist);

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;