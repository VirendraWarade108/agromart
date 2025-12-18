import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Cart routes (authentication required)
 */
router.get('/cart', authenticate, orderController.getCart);
router.post('/cart/add', authenticate, orderController.addToCart);
router.post('/cart/sync', authenticate, orderController.syncCart); // NEW
router.put('/cart/items/:id', authenticate, orderController.updateCartItem);
router.delete('/cart/items/:id', authenticate, orderController.removeFromCart);
router.delete('/cart', authenticate, orderController.clearCart);

// NEW: Cart coupon routes
router.post('/cart/coupon', authenticate, orderController.applyCoupon);
router.delete('/cart/coupon', authenticate, orderController.removeCoupon);

/**
 * Checkout route (authentication required)
 */
router.post('/checkout', authenticate, orderController.checkout);

/**
 * Order routes (authentication required)
 */
router.get('/orders', authenticate, orderController.getUserOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.put('/orders/:id/cancel', authenticate, orderController.cancelOrder);

// NEW: Order tracking alias for frontend compatibility
router.get('/orders/:id/track', authenticate, orderController.getOrderTracking);

// NEW: Order invoice endpoint
router.get('/orders/:id/invoice', authenticate, orderController.getOrderInvoice);

/**
 * Admin order routes (authentication + admin role required)
 */
router.get(
  '/admin/orders',
  authenticate,
  requireAdmin,
  orderController.getAllOrders
);

router.put(
  '/admin/orders/:id/status',
  authenticate,
  requireAdmin,
  orderController.updateOrderStatus
);

export default router;