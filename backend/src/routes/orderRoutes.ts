import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Cart routes (authentication required)
 */
router.get('/cart', authenticate, orderController.getCart);
router.post('/cart/add', authenticate, orderController.addToCart);
router.put('/cart/items/:productId', authenticate, orderController.updateCartItem);
router.delete('/cart/items/:productId', authenticate, orderController.removeFromCart);
router.delete('/cart', authenticate, orderController.clearCart);

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