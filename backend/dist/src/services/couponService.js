"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCouponStats = exports.toggleCouponStatus = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCouponByCode = exports.getCouponById = exports.getAllCoupons = exports.applyCoupon = exports.validateCoupon = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Validate and apply coupon
 */
const validateCoupon = async (code, orderTotal) => {
    // Find coupon by code
    const coupon = await database_1.default.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });
    if (!coupon) {
        throw new errorHandler_1.AppError('Invalid coupon code', 400);
    }
    // Check if coupon is active
    if (!coupon.isActive) {
        throw new errorHandler_1.AppError('This coupon is no longer active', 400);
    }
    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom) {
        throw new errorHandler_1.AppError('This coupon is not yet valid', 400);
    }
    if (now > coupon.validUntil) {
        throw new errorHandler_1.AppError('This coupon has expired', 400);
    }
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new errorHandler_1.AppError('This coupon has reached its usage limit', 400);
    }
    // Check minimum order value
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
        throw new errorHandler_1.AppError(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`, 400);
    }
    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (orderTotal * coupon.value) / 100;
        // Apply max discount limit if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    }
    else if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
        // Discount cannot exceed order total
        if (discountAmount > orderTotal) {
            discountAmount = orderTotal;
        }
    }
    return {
        coupon: {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
        },
        discountAmount: Math.round(discountAmount),
    };
};
exports.validateCoupon = validateCoupon;
/**
 * Apply coupon (increment usage count)
 */
const applyCoupon = async (couponId) => {
    await database_1.default.coupon.update({
        where: { id: couponId },
        data: {
            usedCount: { increment: 1 },
        },
    });
};
exports.applyCoupon = applyCoupon;
/**
 * Get all coupons (Admin)
 */
const getAllCoupons = async (filters) => {
    const where = {};
    if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
    }
    if (filters?.search) {
        where.OR = [
            { code: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    const coupons = await database_1.default.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    return coupons;
};
exports.getAllCoupons = getAllCoupons;
/**
 * Get coupon by ID (Admin)
 */
const getCouponById = async (id) => {
    const coupon = await database_1.default.coupon.findUnique({
        where: { id },
    });
    if (!coupon) {
        throw new errorHandler_1.AppError('Coupon not found', 404);
    }
    return coupon;
};
exports.getCouponById = getCouponById;
/**
 * Get coupon by code (Public - for preview)
 */
const getCouponByCode = async (code) => {
    const coupon = await database_1.default.coupon.findUnique({
        where: { code: code.toUpperCase() },
        select: {
            code: true,
            description: true,
            type: true,
            value: true,
            minOrderValue: true,
            maxDiscount: true,
            validUntil: true,
            isActive: true,
        },
    });
    if (!coupon) {
        throw new errorHandler_1.AppError('Coupon not found', 404);
    }
    return coupon;
};
exports.getCouponByCode = getCouponByCode;
/**
 * Create coupon (Admin)
 */
const createCoupon = async (data) => {
    // Check if code already exists
    const existing = await database_1.default.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
    });
    if (existing) {
        throw new errorHandler_1.AppError('Coupon code already exists', 400);
    }
    // Validate value
    if (data.type === 'percentage' && (data.value < 0 || data.value > 100)) {
        throw new errorHandler_1.AppError('Percentage must be between 0 and 100', 400);
    }
    if (data.type === 'fixed' && data.value < 0) {
        throw new errorHandler_1.AppError('Value must be positive', 400);
    }
    // Create coupon
    const coupon = await database_1.default.coupon.create({
        data: {
            code: data.code.toUpperCase(),
            description: data.description,
            type: data.type,
            value: data.value,
            minOrderValue: data.minOrderValue,
            maxDiscount: data.maxDiscount,
            usageLimit: data.usageLimit,
            validFrom: data.validFrom,
            validUntil: data.validUntil,
            isActive: data.isActive !== undefined ? data.isActive : true,
        },
    });
    return coupon;
};
exports.createCoupon = createCoupon;
/**
 * Update coupon (Admin)
 */
const updateCoupon = async (id, data) => {
    // Check if coupon exists
    await (0, exports.getCouponById)(id);
    // If updating code, check for duplicates
    if (data.code) {
        const existing = await database_1.default.coupon.findFirst({
            where: {
                code: data.code.toUpperCase(),
                id: { not: id },
            },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Coupon code already exists', 400);
        }
    }
    // Validate value if provided
    if (data.type === 'percentage' && data.value !== undefined) {
        if (data.value < 0 || data.value > 100) {
            throw new errorHandler_1.AppError('Percentage must be between 0 and 100', 400);
        }
    }
    if (data.type === 'fixed' && data.value !== undefined && data.value < 0) {
        throw new errorHandler_1.AppError('Value must be positive', 400);
    }
    // Update coupon
    const coupon = await database_1.default.coupon.update({
        where: { id },
        data: {
            ...(data.code && { code: data.code.toUpperCase() }),
            ...data,
        },
    });
    return coupon;
};
exports.updateCoupon = updateCoupon;
/**
 * Delete coupon (Admin)
 */
const deleteCoupon = async (id) => {
    // Check if coupon exists
    await (0, exports.getCouponById)(id);
    await database_1.default.coupon.delete({
        where: { id },
    });
};
exports.deleteCoupon = deleteCoupon;
/**
 * Toggle coupon active status (Admin)
 */
const toggleCouponStatus = async (id) => {
    const coupon = await (0, exports.getCouponById)(id);
    const updated = await database_1.default.coupon.update({
        where: { id },
        data: { isActive: !coupon.isActive },
    });
    return updated;
};
exports.toggleCouponStatus = toggleCouponStatus;
/**
 * Get coupon statistics (Admin)
 */
const getCouponStats = async (id) => {
    const coupon = await (0, exports.getCouponById)(id);
    const totalRevenue = coupon.usedCount * (coupon.type === 'fixed' ? coupon.value : 0);
    return {
        coupon,
        stats: {
            usedCount: coupon.usedCount,
            remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null,
            totalRevenue,
        },
    };
};
exports.getCouponStats = getCouponStats;
