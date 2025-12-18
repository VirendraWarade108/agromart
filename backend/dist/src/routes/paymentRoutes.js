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
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const paymentService = __importStar(require("../services/paymentService"));
const router = (0, express_1.Router)();
/**
 * Create payment intent
 * POST /api/payment/create-intent
 */
router.post('/create-intent', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { amount, orderId } = req.body;
    // Validate required fields
    if (!amount || !orderId) {
        return res.status(400).json({
            success: false,
            message: 'Amount and orderId are required',
        });
    }
    // Validate amount is positive
    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be greater than 0',
        });
    }
    const result = await paymentService.createPaymentIntent(amount, orderId);
    res.status(201).json({
        success: true,
        message: 'Payment intent created successfully',
        data: result,
    });
}));
/**
 * Verify payment
 * POST /api/payment/verify
 */
router.post('/verify', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId, orderId } = req.body;
    // Validate required fields
    if (!paymentId || !orderId) {
        return res.status(400).json({
            success: false,
            message: 'PaymentId and orderId are required',
        });
    }
    const result = await paymentService.verifyPayment(paymentId, orderId);
    res.json({
        success: true,
        data: result,
    });
}));
/**
 * Get payment status
 * GET /api/payment/status/:orderId
 */
router.get('/status/:orderId', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.params;
    const result = await paymentService.getPaymentStatus(orderId);
    res.json({
        success: true,
        data: result,
    });
}));
/**
 * Process refund (Admin only)
 * POST /api/payment/refund
 */
router.post('/refund', auth_1.authenticate, auth_1.requireAdmin, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orderId, amount } = req.body;
    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: 'OrderId is required',
        });
    }
    const result = await paymentService.processRefund(orderId, amount);
    res.json({
        success: true,
        message: 'Refund processed successfully',
        data: result,
    });
}));
exports.default = router;
