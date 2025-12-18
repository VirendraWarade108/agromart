"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackingTimeline = exports.bulkUpdateOrderStatus = exports.getOrdersByStatus = exports.getLatestTracking = exports.addTrackingUpdate = exports.getOrderTracking = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get order tracking history
 */
const getOrderTracking = async (orderId, userId) => {
    // Get order with tracking
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            tracking: {
                orderBy: { timestamp: 'asc' },
            },
        },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Verify user access (if userId provided)
    if (userId && order.userId !== userId) {
        throw new errorHandler_1.AppError('Unauthorized to access this order', 403);
    }
    return order.tracking;
};
exports.getOrderTracking = getOrderTracking;
/**
 * Add tracking update (Admin)
 */
const addTrackingUpdate = async (trackingData) => {
    // Verify order exists
    const order = await database_1.default.order.findUnique({
        where: { id: trackingData.orderId },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Create tracking entry
    const tracking = await database_1.default.orderTracking.create({
        data: {
            orderId: trackingData.orderId,
            status: trackingData.status,
            location: trackingData.location,
            description: trackingData.description,
            metadata: trackingData.metadata || null,
        },
    });
    // Update order status
    await database_1.default.order.update({
        where: { id: trackingData.orderId },
        data: { status: trackingData.status },
    });
    return tracking;
};
exports.addTrackingUpdate = addTrackingUpdate;
/**
 * Get latest tracking status
 */
const getLatestTracking = async (orderId) => {
    const latestTracking = await database_1.default.orderTracking.findFirst({
        where: { orderId },
        orderBy: { timestamp: 'desc' },
    });
    if (!latestTracking) {
        throw new errorHandler_1.AppError('No tracking information found', 404);
    }
    return latestTracking;
};
exports.getLatestTracking = getLatestTracking;
/**
 * Get all orders by status (Admin)
 */
const getOrdersByStatus = async (status) => {
    const orders = await database_1.default.order.findMany({
        where: { status },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                },
            },
            tracking: {
                orderBy: { timestamp: 'desc' },
                take: 1,
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return orders;
};
exports.getOrdersByStatus = getOrdersByStatus;
/**
 * Bulk update order status (Admin)
 */
const bulkUpdateOrderStatus = async (updates) => {
    const results = await Promise.all(updates.map(async (update) => {
        try {
            const tracking = await (0, exports.addTrackingUpdate)({
                orderId: update.orderId,
                status: update.status,
                description: update.description,
                location: update.location,
            });
            return { success: true, orderId: update.orderId, tracking };
        }
        catch (error) {
            return {
                success: false,
                orderId: update.orderId,
                error: error instanceof Error ? error.message : 'Update failed',
            };
        }
    }));
    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    return {
        total: updates.length,
        succeeded: succeeded.length,
        failed: failed.length,
        results,
    };
};
exports.bulkUpdateOrderStatus = bulkUpdateOrderStatus;
/**
 * Get tracking timeline with estimated delivery
 */
const getTrackingTimeline = async (orderId, userId) => {
    const tracking = await (0, exports.getOrderTracking)(orderId, userId);
    // Define status flow
    const statusFlow = [
        'order_placed',
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
    ];
    // Build timeline
    const timeline = statusFlow.map((status) => {
        const trackingEntry = tracking.find((t) => t.status === status);
        return {
            status,
            completed: !!trackingEntry,
            timestamp: trackingEntry?.timestamp,
            description: trackingEntry?.description,
            location: trackingEntry?.location,
        };
    });
    // Calculate estimated delivery
    const shippedEntry = tracking.find((t) => t.status === 'shipped');
    let estimatedDelivery = null;
    if (shippedEntry) {
        // Add 3-5 days from shipped date
        const deliveryDate = new Date(shippedEntry.timestamp);
        deliveryDate.setDate(deliveryDate.getDate() + 4); // Average 4 days
        estimatedDelivery = deliveryDate;
    }
    return {
        timeline,
        estimatedDelivery,
        currentStatus: tracking[tracking.length - 1]?.status || 'order_placed',
    };
};
exports.getTrackingTimeline = getTrackingTimeline;
