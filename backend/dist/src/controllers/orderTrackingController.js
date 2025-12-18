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
exports.bulkUpdateOrderStatus = exports.getOrdersByStatus = exports.addTrackingUpdate = exports.getLatestTracking = exports.getTrackingTimeline = exports.getOrderTracking = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const orderTrackingService = __importStar(require("../services/orderTrackingService"));
// ============================================
// USER TRACKING ENDPOINTS
// ============================================
/**
 * Get order tracking
 * GET /api/orders/:orderId/tracking
 */
exports.getOrderTracking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { orderId } = req.params;
    const tracking = await orderTrackingService.getOrderTracking(orderId, userId);
    res.json({
        success: true,
        data: tracking,
    });
});
/**
 * Get order tracking timeline
 * GET /api/orders/:orderId/timeline
 */
exports.getTrackingTimeline = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { orderId } = req.params;
    const timeline = await orderTrackingService.getTrackingTimeline(orderId, userId);
    res.json({
        success: true,
        data: timeline,
    });
});
/**
 * Get latest tracking status
 * GET /api/orders/:orderId/tracking/latest
 */
exports.getLatestTracking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orderId } = req.params;
    const latest = await orderTrackingService.getLatestTracking(orderId);
    res.json({
        success: true,
        data: latest,
    });
});
// ============================================
// ADMIN TRACKING ENDPOINTS
// ============================================
/**
 * Add tracking update
 * POST /api/admin/tracking
 */
exports.addTrackingUpdate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orderId, status, location, description, metadata } = req.body;
    // Validate required fields
    if (!orderId || !status || !description) {
        return res.status(400).json({
            success: false,
            message: 'Order ID, status, and description are required',
        });
    }
    const tracking = await orderTrackingService.addTrackingUpdate({
        orderId,
        status,
        location,
        description,
        metadata,
    });
    res.status(201).json({
        success: true,
        message: 'Tracking update added successfully',
        data: tracking,
    });
});
/**
 * Get orders by status
 * GET /api/admin/tracking/status/:status
 */
exports.getOrdersByStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.params;
    const orders = await orderTrackingService.getOrdersByStatus(status);
    res.json({
        success: true,
        count: orders.length,
        data: orders,
    });
});
/**
 * Bulk update order status
 * POST /api/admin/tracking/bulk-update
 */
exports.bulkUpdateOrderStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            success: false,
            message: 'Updates array is required',
        });
    }
    const result = await orderTrackingService.bulkUpdateOrderStatus(updates);
    res.json({
        success: true,
        message: `Bulk update completed. ${result.succeeded} succeeded, ${result.failed} failed.`,
        data: result,
    });
});
