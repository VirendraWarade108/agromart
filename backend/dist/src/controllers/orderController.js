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
exports.updateOrderStatus = exports.getAllOrders = exports.getOrderInvoice = exports.getOrderTracking = exports.cancelOrder = exports.getOrderById = exports.getUserOrders = exports.checkout = exports.syncCart = exports.removeCoupon = exports.applyCoupon = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const cartService = __importStar(require("../services/cartService"));
const orderService = __importStar(require("../services/orderService"));
const orderTrackingService = __importStar(require("../services/orderTrackingService"));
// ============================================
// CART CONTROLLERS
// ============================================
/**
 * Get user's cart
 * GET /api/cart
 */
exports.getCart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const cart = await cartService.getCart(userId);
    res.json({
        success: true,
        data: {
            items: cart.items,
            coupon: null, // Coupons are session-based, not stored in DB
        },
    });
});
/**
 * Add item to cart
 * POST /api/cart/add
 */
exports.addToCart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
        return res.status(400).json({
            success: false,
            message: 'Product ID is required',
        });
    }
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json({
        success: true,
        message: 'Item added to cart',
        data: {
            items: cart.items,
            coupon: null,
        },
    });
});
/**
 * Update cart item quantity
 * PUT /api/cart/items/:id
 */
exports.updateCartItem = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params; // Changed from productId to id (cart item ID)
    const { quantity } = req.body;
    if (quantity === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Quantity is required',
        });
    }
    const cart = await cartService.updateCartItem(userId, id, quantity);
    res.json({
        success: true,
        message: 'Cart updated',
        data: {
            items: cart.items,
            coupon: null,
        },
    });
});
/**
 * Remove item from cart
 * DELETE /api/cart/items/:id
 */
exports.removeFromCart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params; // Changed from productId to id (cart item ID)
    const cart = await cartService.removeFromCart(userId, id);
    res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
            items: cart.items,
            coupon: null,
        },
    });
});
/**
 * Clear cart
 * DELETE /api/cart
 */
exports.clearCart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const cart = await cartService.clearCart(userId);
    res.json({
        success: true,
        message: 'Cart cleared',
        data: {
            items: cart.items,
            coupon: null,
        },
    });
});
/**
 * Apply coupon to cart (NEW)
 * POST /api/cart/coupon
 */
exports.applyCoupon = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Coupon code is required',
        });
    }
    const result = await cartService.applyCouponToCart(userId, code);
    res.json({
        success: true,
        message: 'Coupon applied successfully',
        data: {
            items: result.cart.items,
            coupon: {
                code: result.coupon.code,
                discount: result.discountAmount,
            },
            totals: result.totals,
        },
    });
});
/**
 * Remove coupon from cart (NEW)
 * DELETE /api/cart/coupon
 */
exports.removeCoupon = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const result = await cartService.removeCouponFromCart(userId);
    res.json({
        success: true,
        message: 'Coupon removed',
        data: {
            items: result.cart.items,
            coupon: null,
            totals: result.totals,
        },
    });
});
/**
 * Sync cart with server
 * POST /api/cart/sync
 */
exports.syncCart = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: 'Items array is required',
        });
    }
    const cart = await cartService.syncCart(userId, items);
    res.json({
        success: true,
        message: 'Cart synced successfully',
        data: {
            items: cart.items,
            coupon: null,
        },
    });
});
// ============================================
// ORDER CONTROLLERS
// ============================================
/**
 * Create order (Checkout)
 * POST /api/checkout
 */
exports.checkout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const order = await orderService.createOrder(userId, {
        shippingAddress,
        paymentMethod,
        couponCode,
    });
    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order },
    });
});
/**
 * Get user's orders
 * GET /api/orders
 */
exports.getUserOrders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { page, limit, status } = req.query;
    const result = await orderService.getUserOrders(userId, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        status: status,
    });
    res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
    });
});
/**
 * Get single order
 * GET /api/orders/:id
 */
exports.getOrderById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const order = await orderService.getOrderById(id, userId);
    res.json({
        success: true,
        data: order,
    });
});
/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
exports.cancelOrder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const order = await orderService.cancelOrder(id, userId);
    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
    });
});
/**
 * Get order tracking (alias for frontend compatibility)
 * GET /api/orders/:id/track
 */
exports.getOrderTracking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const tracking = await orderTrackingService.getOrderTracking(id, userId);
    res.json({
        success: true,
        data: tracking,
    });
});
/**
 * Get order invoice
 * GET /api/orders/:id/invoice
 */
exports.getOrderInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const invoice = await orderService.getOrderInvoice(id, userId);
    res.json({
        success: true,
        data: invoice,
    });
});
// ============================================
// ADMIN ORDER CONTROLLERS
// ============================================
/**
 * Get all orders (Admin only)
 * GET /api/admin/orders
 */
exports.getAllOrders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page, limit, status } = req.query;
    const result = await orderService.getAllOrders({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        status: status,
    });
    res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
    });
});
/**
 * Update order status (Admin only)
 * PUT /api/admin/orders/:id/status
 */
exports.updateOrderStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required',
        });
    }
    const order = await orderService.updateOrderStatus(id, status);
    res.json({
        success: true,
        message: 'Order status updated',
        data: order,
    });
});
