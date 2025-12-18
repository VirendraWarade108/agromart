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
exports.getCouponStats = exports.toggleCouponStatus = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponById = exports.getAllCoupons = exports.getCouponByCode = exports.validateCoupon = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const couponService = __importStar(require("../services/couponService"));
// ============================================
// PUBLIC COUPON ENDPOINTS
// ============================================
/**
 * Validate coupon code
 * POST /api/cart/coupon/validate
 */
exports.validateCoupon = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { code, orderTotal } = req.body;
    if (!code || orderTotal === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Coupon code and order total are required',
        });
    }
    const result = await couponService.validateCoupon(code, orderTotal);
    res.json({
        success: true,
        message: 'Coupon is valid',
        data: result,
    });
});
/**
 * Get coupon details by code (preview)
 * GET /api/coupons/:code
 */
exports.getCouponByCode = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { code } = req.params;
    const coupon = await couponService.getCouponByCode(code);
    res.json({
        success: true,
        data: coupon,
    });
});
// ============================================
// ADMIN COUPON ENDPOINTS
// ============================================
/**
 * Get all coupons (Admin)
 * GET /api/admin/coupons
 */
exports.getAllCoupons = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isActive, search } = req.query;
    const coupons = await couponService.getAllCoupons({
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search,
    });
    res.json({
        success: true,
        data: coupons,
    });
});
/**
 * Get single coupon by ID (Admin)
 * GET /api/admin/coupons/:id
 */
exports.getCouponById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(id);
    res.json({
        success: true,
        data: coupon,
    });
});
/**
 * Create coupon (Admin)
 * POST /api/admin/coupons
 */
exports.createCoupon = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, validFrom, validUntil, isActive, } = req.body;
    // Validation
    if (!code || !type || value === undefined || !validUntil) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: code, type, value, validUntil',
        });
    }
    if (!['percentage', 'fixed'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Type must be either "percentage" or "fixed"',
        });
    }
    const coupon = await couponService.createCoupon({
        code,
        description,
        type,
        value: parseInt(value),
        minOrderValue: minOrderValue ? parseInt(minOrderValue) : undefined,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: new Date(validUntil),
        isActive,
    });
    res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
    });
});
/**
 * Update coupon (Admin)
 * PUT /api/admin/coupons/:id
 */
exports.updateCoupon = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, validFrom, validUntil, isActive, } = req.body;
    const coupon = await couponService.updateCoupon(id, {
        code,
        description,
        type,
        value: value !== undefined ? parseInt(value) : undefined,
        minOrderValue: minOrderValue !== undefined ? parseInt(minOrderValue) : undefined,
        maxDiscount: maxDiscount !== undefined ? parseInt(maxDiscount) : undefined,
        usageLimit: usageLimit !== undefined ? parseInt(usageLimit) : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        isActive,
    });
    res.json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
    });
});
/**
 * Delete coupon (Admin)
 * DELETE /api/admin/coupons/:id
 */
exports.deleteCoupon = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await couponService.deleteCoupon(id);
    res.json({
        success: true,
        message: 'Coupon deleted successfully',
    });
});
/**
 * Toggle coupon status (Admin)
 * PUT /api/admin/coupons/:id/toggle
 */
exports.toggleCouponStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const coupon = await couponService.toggleCouponStatus(id);
    res.json({
        success: true,
        message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
        data: coupon,
    });
});
/**
 * Get coupon statistics (Admin)
 * GET /api/admin/coupons/:id/stats
 */
exports.getCouponStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const stats = await couponService.getCouponStats(id);
    res.json({
        success: true,
        data: stats,
    });
});
