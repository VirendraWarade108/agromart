import { Router } from 'express';
import * as couponController from '../controllers/couponController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * =========================
 * ADMIN ROUTES (FIRST)
 * =========================
 */

// Get all coupons
router.get('/admin/list', authenticate, requireAdmin, couponController.getAllCoupons);

// Get coupon by ID
router.get('/admin/:id', authenticate, requireAdmin, couponController.getCouponById);

// Create coupon
router.post('/admin', authenticate, requireAdmin, couponController.createCoupon);

// Update coupon
router.put('/admin/:id', authenticate, requireAdmin, couponController.updateCoupon);

// Toggle status
router.put('/admin/:id/toggle', authenticate, requireAdmin, couponController.toggleCouponStatus);

// Get stats
router.get('/admin/:id/stats', authenticate, requireAdmin, couponController.getCouponStats);

// Delete coupon
router.delete('/admin/:id', authenticate, requireAdmin, couponController.deleteCoupon);

/**
 * =========================
 * USER / PUBLIC ROUTES (LAST)
 * =========================
 */

// Validate coupon
router.post('/validate', authenticate, couponController.validateCoupon);

// Get coupon by code (⚠️ MUST BE LAST)
router.get('/:code', couponController.getCouponByCode);

export default router;
