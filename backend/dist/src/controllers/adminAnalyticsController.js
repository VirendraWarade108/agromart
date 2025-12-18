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
exports.getUserStatistics = exports.getProductPerformance = exports.getSalesReport = exports.getDashboardStats = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const adminAnalyticsService = __importStar(require("../services/adminAnalyticsService"));
/**
 * Get dashboard statistics
 * GET /api/admin/analytics/dashboard
 */
exports.getDashboardStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await adminAnalyticsService.getDashboardStats();
    res.json({
        success: true,
        data: stats,
    });
});
/**
 * Get sales report
 * GET /api/admin/analytics/sales
 */
exports.getSalesReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, groupBy } = req.query;
    const report = await adminAnalyticsService.getSalesReport({
        startDate: startDate,
        endDate: endDate,
        groupBy: groupBy,
    });
    res.json({
        success: true,
        data: report,
    });
});
/**
 * Get product performance
 * GET /api/admin/analytics/products
 */
exports.getProductPerformance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { limit } = req.query;
    const performance = await adminAnalyticsService.getProductPerformance(limit ? parseInt(limit) : undefined);
    res.json({
        success: true,
        data: performance,
    });
});
/**
 * Get user statistics
 * GET /api/admin/analytics/users
 */
exports.getUserStatistics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stats = await adminAnalyticsService.getUserStatistics();
    res.json({
        success: true,
        data: stats,
    });
});
