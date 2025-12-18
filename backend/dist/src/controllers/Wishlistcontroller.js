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
exports.moveToCart = exports.getWishlistCount = exports.clearWishlist = exports.checkWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const wishlistService = __importStar(require("../services/Wishlistservice"));
// ============================================
// WISHLIST ENDPOINTS
// ============================================
/**
 * Get user's wishlist
 * GET /api/wishlist
 */
exports.getWishlist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const wishlist = await wishlistService.getUserWishlist(userId);
    res.json({
        success: true,
        count: wishlist.length,
        data: wishlist,
    });
});
/**
 * Add product to wishlist
 * POST /api/wishlist
 */
exports.addToWishlist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.body;
    if (!productId) {
        return res.status(400).json({
            success: false,
            message: 'Product ID is required',
        });
    }
    const wishlistItem = await wishlistService.addToWishlist(userId, productId);
    res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        data: wishlistItem,
    });
});
/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
exports.removeFromWishlist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;
    const result = await wishlistService.removeFromWishlist(userId, productId);
    res.json({
        success: true,
        message: result.message,
    });
});
/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
exports.checkWishlist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;
    const result = await wishlistService.isInWishlist(userId, productId);
    res.json({
        success: true,
        data: result,
    });
});
/**
 * Clear entire wishlist
 * DELETE /api/wishlist
 */
exports.clearWishlist = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const result = await wishlistService.clearWishlist(userId);
    res.json({
        success: true,
        message: result.message,
        deletedCount: result.deletedCount,
    });
});
/**
 * Get wishlist count
 * GET /api/wishlist/count
 */
exports.getWishlistCount = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const result = await wishlistService.getWishlistCount(userId);
    res.json({
        success: true,
        data: result,
    });
});
/**
 * Move items from wishlist to cart
 * POST /api/wishlist/move-to-cart
 */
exports.moveToCart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({
            success: false,
            message: 'Product IDs array is required',
        });
    }
    const results = await wishlistService.moveWishlistToCart(userId, productIds);
    res.json({
        success: true,
        message: `${results.added.length} items moved to cart, ${results.failed.length} failed`,
        data: results,
    });
});
