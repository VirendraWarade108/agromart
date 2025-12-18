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
const wishlistController = __importStar(require("../controllers/Wishlistcontroller"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// ============================================
// WISHLIST ROUTES
// Mounted at /api/users/wishlist in app.ts
// ============================================
/**
 * Get wishlist count
 * GET /api/users/wishlist/count
 * Note: Must come before /:productId to avoid route conflicts
 */
router.get('/count', wishlistController.getWishlistCount);
/**
 * Check if product is in wishlist
 * GET /api/users/wishlist/check/:productId
 */
router.get('/check/:productId', wishlistController.checkWishlist);
/**
 * Move items to cart
 * POST /api/users/wishlist/move-to-cart
 */
router.post('/move-to-cart', wishlistController.moveToCart);
/**
 * Get user's wishlist
 * GET /api/users/wishlist
 */
router.get('/', wishlistController.getWishlist);
/**
 * Add product to wishlist
 * POST /api/users/wishlist
 */
router.post('/', wishlistController.addToWishlist);
/**
 * Clear entire wishlist
 * DELETE /api/users/wishlist
 */
router.delete('/', wishlistController.clearWishlist);
/**
 * Remove product from wishlist
 * DELETE /api/users/wishlist/:productId
 */
router.delete('/:productId', wishlistController.removeFromWishlist);
exports.default = router;
