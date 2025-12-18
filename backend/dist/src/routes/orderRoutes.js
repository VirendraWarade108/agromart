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
const orderController = __importStar(require("../controllers/orderController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Cart routes (authentication required)
 */
router.get('/cart', auth_1.authenticate, orderController.getCart);
router.post('/cart/add', auth_1.authenticate, orderController.addToCart);
router.post('/cart/sync', auth_1.authenticate, orderController.syncCart); // NEW
router.put('/cart/items/:id', auth_1.authenticate, orderController.updateCartItem);
router.delete('/cart/items/:id', auth_1.authenticate, orderController.removeFromCart);
router.delete('/cart', auth_1.authenticate, orderController.clearCart);
// NEW: Cart coupon routes
router.post('/cart/coupon', auth_1.authenticate, orderController.applyCoupon);
router.delete('/cart/coupon', auth_1.authenticate, orderController.removeCoupon);
/**
 * Checkout route (authentication required)
 */
router.post('/checkout', auth_1.authenticate, orderController.checkout);
/**
 * Order routes (authentication required)
 */
router.get('/orders', auth_1.authenticate, orderController.getUserOrders);
router.get('/orders/:id', auth_1.authenticate, orderController.getOrderById);
router.put('/orders/:id/cancel', auth_1.authenticate, orderController.cancelOrder);
// NEW: Order tracking alias for frontend compatibility
router.get('/orders/:id/track', auth_1.authenticate, orderController.getOrderTracking);
// NEW: Order invoice endpoint
router.get('/orders/:id/invoice', auth_1.authenticate, orderController.getOrderInvoice);
/**
 * Admin order routes (authentication + admin role required)
 */
router.get('/admin/orders', auth_1.authenticate, auth_1.requireAdmin, orderController.getAllOrders);
router.put('/admin/orders/:id/status', auth_1.authenticate, auth_1.requireAdmin, orderController.updateOrderStatus);
exports.default = router;
