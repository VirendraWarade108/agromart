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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCart = exports.removeCouponFromCart = exports.applyCouponToCart = exports.calculateCartTotals = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const couponService = __importStar(require("./couponService"));
/**
 * Get user's cart with all items
 */
const getCart = async (userId) => {
    // Find or create cart for user
    let cart = await database_1.default.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            price: true,
                            originalPrice: true,
                            image: true,
                            stock: true,
                            category: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    // Create cart if doesn't exist
    if (!cart) {
        cart = await database_1.default.cart.create({
            data: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                originalPrice: true,
                                image: true,
                                stock: true,
                                category: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    // Transform response to match frontend expectations
    const transformedCart = {
        ...cart,
        items: cart.items.map((item) => ({
            ...item,
            product: {
                ...item.product,
                thumbnail: item.product.image, // Frontend expects 'thumbnail'
                inStock: (item.product.stock || 0) > 0, // Frontend expects 'inStock' boolean
                category: item.product.category?.name || 'Uncategorized', // Frontend expects category string
            },
            price: item.product.price, // Add price at item level for frontend
        })),
    };
    return transformedCart;
};
exports.getCart = getCart;
/**
 * Add product to cart
 */
const addToCart = async (userId, productId, quantity = 1) => {
    // Validate quantity
    if (quantity < 1) {
        throw new errorHandler_1.AppError('Quantity must be at least 1', 400);
    }
    // Check if product exists and has stock
    const product = await database_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new errorHandler_1.AppError('Product not found', 404);
    }
    if (!product.stock || product.stock < quantity) {
        throw new errorHandler_1.AppError('Product out of stock', 400);
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
    // Check if product already in cart
    const existingItem = await database_1.default.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId,
            },
        },
    });
    if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
            throw new errorHandler_1.AppError('Not enough stock available', 400);
        }
        await database_1.default.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
        });
    }
    else {
        // Add new item
        await database_1.default.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });
    }
    // Return updated cart
    return (0, exports.getCart)(userId);
};
exports.addToCart = addToCart;
/**
 * Update cart item quantity by cart item ID
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
    // Validate quantity
    if (quantity < 0) {
        throw new errorHandler_1.AppError('Quantity cannot be negative', 400);
    }
    // If quantity is 0, remove item
    if (quantity === 0) {
        return (0, exports.removeFromCart)(userId, cartItemId);
    }
    // Get cart
    const cart = await database_1.default.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        throw new errorHandler_1.AppError('Cart not found', 404);
    }
    // Find cart item by ID
    const cartItem = await database_1.default.cartItem.findUnique({
        where: { id: cartItemId },
        include: { product: true },
    });
    if (!cartItem || cartItem.cartId !== cart.id) {
        throw new errorHandler_1.AppError('Item not in cart', 404);
    }
    // Check stock
    if (!cartItem.product.stock || cartItem.product.stock < quantity) {
        throw new errorHandler_1.AppError('Not enough stock available', 400);
    }
    // Update quantity
    await database_1.default.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
    });
    // Return updated cart
    return (0, exports.getCart)(userId);
};
exports.updateCartItem = updateCartItem;
/**
 * Remove item from cart by cart item ID
 */
const removeFromCart = async (userId, cartItemId) => {
    // Get cart
    const cart = await database_1.default.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        throw new errorHandler_1.AppError('Cart not found', 404);
    }
    // Verify item belongs to user's cart
    const cartItem = await database_1.default.cartItem.findUnique({
        where: { id: cartItemId },
    });
    if (!cartItem || cartItem.cartId !== cart.id) {
        throw new errorHandler_1.AppError('Item not in cart', 404);
    }
    // Delete item
    await database_1.default.cartItem.delete({
        where: { id: cartItemId },
    });
    // Return updated cart
    return (0, exports.getCart)(userId);
};
exports.removeFromCart = removeFromCart;
/**
 * Clear entire cart
 */
const clearCart = async (userId) => {
    const cart = await database_1.default.cart.findUnique({
        where: { userId },
    });
    if (!cart) {
        throw new errorHandler_1.AppError('Cart not found', 404);
    }
    // Delete all items
    await database_1.default.cartItem.deleteMany({
        where: { cartId: cart.id },
    });
    return (0, exports.getCart)(userId);
};
exports.clearCart = clearCart;
/**
 * Calculate cart totals
 */
const calculateCartTotals = (cart, discountAmount = 0) => {
    let subtotal = 0;
    cart.items.forEach((item) => {
        subtotal += item.product.price * item.quantity;
    });
    const total = Math.max(0, subtotal - discountAmount);
    return {
        subtotal,
        discount: discountAmount,
        total,
    };
};
exports.calculateCartTotals = calculateCartTotals;
/**
 * Apply coupon to cart (NEW)
 */
const applyCouponToCart = async (userId, couponCode) => {
    // Get cart
    const cart = await (0, exports.getCart)(userId);
    if (!cart.items || cart.items.length === 0) {
        throw new errorHandler_1.AppError('Cart is empty', 400);
    }
    // Calculate subtotal
    const totals = (0, exports.calculateCartTotals)(cart, 0);
    // Validate coupon
    const result = await couponService.validateCoupon(couponCode, totals.subtotal);
    return {
        cart,
        coupon: result.coupon,
        discountAmount: result.discountAmount,
        totals: (0, exports.calculateCartTotals)(cart, result.discountAmount),
    };
};
exports.applyCouponToCart = applyCouponToCart;
/**
 * Remove coupon from cart (NEW)
 */
const removeCouponFromCart = async (userId) => {
    const cart = await (0, exports.getCart)(userId);
    const totals = (0, exports.calculateCartTotals)(cart, 0);
    return {
        cart,
        coupon: null,
        discountAmount: 0,
        totals,
    };
};
exports.removeCouponFromCart = removeCouponFromCart;
/**
 * Sync cart with server (merge local and server carts)
 * POST /api/cart/sync
 */
const syncCart = async (userId, localItems) => {
    // Get or create server cart
    const serverCart = await (0, exports.getCart)(userId);
    // Merge logic: for each local item, add/update in server cart
    for (const localItem of localItems) {
        try {
            // Check if product exists
            const product = await database_1.default.product.findUnique({
                where: { id: localItem.productId },
            });
            if (!product || !product.stock || product.stock < 1) {
                // Skip items that are no longer available
                continue;
            }
            // Find existing cart item
            const existingItem = await database_1.default.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: serverCart.id,
                        productId: localItem.productId,
                    },
                },
            });
            if (existingItem) {
                // Update to higher quantity (local or server)
                const newQuantity = Math.max(existingItem.quantity, localItem.quantity);
                const cappedQuantity = Math.min(newQuantity, product.stock, 50);
                await database_1.default.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: cappedQuantity },
                });
            }
            else {
                // Add new item from local cart
                const cappedQuantity = Math.min(localItem.quantity, product.stock, 50);
                await database_1.default.cartItem.create({
                    data: {
                        cartId: serverCart.id,
                        productId: localItem.productId,
                        quantity: cappedQuantity,
                    },
                });
            }
        }
        catch (error) {
            console.error(`Failed to sync item ${localItem.productId}:`, error);
            // Continue with other items
        }
    }
    // Return merged cart
    return (0, exports.getCart)(userId);
};
exports.syncCart = syncCart;
