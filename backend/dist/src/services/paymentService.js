"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRefund = exports.getPaymentStatus = exports.verifyPayment = exports.createPaymentIntent = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
// In-memory store for payment intents (in production, use database)
const paymentIntents = new Map();
/**
 * Create payment intent
 * Simulates creating a payment session with a payment provider
 */
const createPaymentIntent = async (amount, orderId) => {
    // Validate order exists
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            items: true,
        },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Validate amount matches order total
    if (Math.abs(order.total - amount) > 0.01) {
        throw new errorHandler_1.AppError('Payment amount does not match order total', 400);
    }
    // Generate mock payment intent ID
    const paymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Create payment intent
    const intent = {
        id: paymentId,
        amount,
        orderId,
        status: 'pending',
        createdAt: new Date(),
    };
    // Store in memory
    paymentIntents.set(paymentId, intent);
    // Update order status to processing
    await database_1.default.order.update({
        where: { id: orderId },
        data: { status: 'processing' },
    });
    return {
        paymentId,
        clientSecret: `${paymentId}_secret_${Math.random().toString(36).substr(2, 9)}`,
        status: intent.status,
        amount: intent.amount,
    };
};
exports.createPaymentIntent = createPaymentIntent;
/**
 * Verify payment
 * Simulates payment verification after user completes payment
 */
const verifyPayment = async (paymentId, orderId) => {
    // Get payment intent
    const intent = paymentIntents.get(paymentId);
    if (!intent) {
        throw new errorHandler_1.AppError('Payment intent not found', 404);
    }
    // Validate order ID matches
    if (intent.orderId !== orderId) {
        throw new errorHandler_1.AppError('Payment does not match order', 400);
    }
    // Validate order exists
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Simulate payment processing
    // In real implementation, this would verify with payment provider
    const isSuccess = Math.random() > 0.1; // 90% success rate for testing
    if (isSuccess) {
        // Update payment intent status
        intent.status = 'succeeded';
        paymentIntents.set(paymentId, intent);
        // Update order status to paid
        await database_1.default.order.update({
            where: { id: orderId },
            data: { status: 'paid' },
        });
        return {
            success: true,
            paymentId,
            status: 'succeeded',
            message: 'Payment verified successfully',
        };
    }
    else {
        // Payment failed
        intent.status = 'failed';
        paymentIntents.set(paymentId, intent);
        // Update order status to failed
        await database_1.default.order.update({
            where: { id: orderId },
            data: { status: 'failed' },
        });
        throw new errorHandler_1.AppError('Payment verification failed', 400);
    }
};
exports.verifyPayment = verifyPayment;
/**
 * Get payment status
 * Check the current status of a payment for an order
 */
const getPaymentStatus = async (orderId) => {
    // Validate order exists
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
        },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Find payment intent for this order
    let paymentIntent;
    for (const [, intent] of paymentIntents.entries()) {
        if (intent.orderId === orderId) {
            paymentIntent = intent;
            break;
        }
    }
    if (!paymentIntent) {
        return {
            orderId,
            orderStatus: order.status,
            paymentStatus: 'no_payment',
            message: 'No payment initiated for this order',
        };
    }
    return {
        orderId,
        orderStatus: order.status,
        paymentId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        amount: paymentIntent.amount,
        createdAt: paymentIntent.createdAt,
    };
};
exports.getPaymentStatus = getPaymentStatus;
/**
 * Process refund (Admin only)
 * Simulates refunding a payment
 */
const processRefund = async (orderId, amount) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Can only refund paid orders
    if (order.status !== 'paid' && order.status !== 'delivered') {
        throw new errorHandler_1.AppError('Order cannot be refunded in current status', 400);
    }
    const refundAmount = amount || order.total;
    if (refundAmount > order.total) {
        throw new errorHandler_1.AppError('Refund amount cannot exceed order total', 400);
    }
    // Update order status
    await database_1.default.order.update({
        where: { id: orderId },
        data: { status: 'refunded' },
    });
    // Generate refund ID
    const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
        refundId,
        orderId,
        amount: refundAmount,
        status: 'succeeded',
        message: 'Refund processed successfully',
    };
};
exports.processRefund = processRefund;
