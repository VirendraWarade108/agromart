"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveWishlistToCart = exports.getWishlistCount = exports.clearWishlist = exports.isInWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getUserWishlist = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get user's wishlist
 */
const getUserWishlist = async (userId) => {
    const wishlistItems = await database_1.default.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    originalPrice: true,
                    stock: true,
                    images: true,
                    rating: true,
                    reviews: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return wishlistItems;
};
exports.getUserWishlist = getUserWishlist;
/**
 * Add product to wishlist
 */
const addToWishlist = async (userId, productId) => {
    // Check if product exists
    const product = await database_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    // Check if already in wishlist
    const existingItem = await database_1.default.wishlist.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });
    if (existingItem) {
        throw new errorHandler_1.AppError('Product already in wishlist', 400);
    }
    // Add to wishlist
    const wishlistItem = await database_1.default.wishlist.create({
        data: {
            userId,
            productId,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    originalPrice: true,
                    stock: true,
                    images: true,
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    return wishlistItem;
};
exports.addToWishlist = addToWishlist;
/**
 * Remove product from wishlist
 */
const removeFromWishlist = async (userId, productId) => {
    // Check if item exists in wishlist
    const existingItem = await database_1.default.wishlist.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });
    if (!existingItem) {
        throw new errorHandler_1.AppError('Product not in wishlist', 404);
    }
    // Remove from wishlist
    await database_1.default.wishlist.delete({
        where: {
            id: existingItem.id,
        },
    });
    return { message: 'Product removed from wishlist' };
};
exports.removeFromWishlist = removeFromWishlist;
/**
 * Check if product is in user's wishlist
 */
const isInWishlist = async (userId, productId) => {
    const item = await database_1.default.wishlist.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });
    return { inWishlist: !!item };
};
exports.isInWishlist = isInWishlist;
/**
 * Clear entire wishlist
 */
const clearWishlist = async (userId) => {
    const result = await database_1.default.wishlist.deleteMany({
        where: { userId },
    });
    return {
        message: 'Wishlist cleared',
        deletedCount: result.count,
    };
};
exports.clearWishlist = clearWishlist;
/**
 * Get wishlist count
 */
const getWishlistCount = async (userId) => {
    const count = await database_1.default.wishlist.count({
        where: { userId },
    });
    return { count };
};
exports.getWishlistCount = getWishlistCount;
/**
 * Move wishlist items to cart (bulk operation)
 */
const moveWishlistToCart = async (userId, productIds) => {
    const results = {
        added: [],
        failed: [],
    };
    for (const productId of productIds) {
        try {
            // Check if product exists and has stock
            const product = await database_1.default.product.findUnique({
                where: { id: productId },
            });
            if (!product) {
                results.failed.push({ productId, reason: 'Product not found' });
                continue;
            }
            if (product.stock === 0) {
                results.failed.push({ productId, reason: 'Out of stock' });
                continue;
            }
            // Get or create cart
            let cart = await database_1.default.cart.findUnique({
                where: { userId },
            });
            if (!cart) {
                cart = await database_1.default.cart.create({
                    data: { userId },
                });
            }
            // Check if already in cart
            const existingCartItem = await database_1.default.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    },
                },
            });
            if (existingCartItem) {
                // Update quantity
                await database_1.default.cartItem.update({
                    where: { id: existingCartItem.id },
                    data: { quantity: existingCartItem.quantity + 1 },
                });
            }
            else {
                // Add to cart
                await database_1.default.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity: 1,
                    },
                });
            }
            // Remove from wishlist
            await database_1.default.wishlist.deleteMany({
                where: {
                    userId,
                    productId,
                },
            });
            results.added.push(productId);
        }
        catch (error) {
            results.failed.push({
                productId,
                reason: 'Failed to add to cart',
            });
        }
    }
    return results;
};
exports.moveWishlistToCart = moveWishlistToCart;
