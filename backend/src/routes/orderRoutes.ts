import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as orderValidators from '../validators/order';

const router = Router();

// Replace existing routes with validated versions:
router.post('/cart/add', authenticate, validate(orderValidators.addToCartSchema), orderController.addToCart);
router.post('/cart/sync', authenticate, validate(orderValidators.syncCartSchema), orderController.syncCart);
router.put('/cart/items/:id', authenticate, validate(orderValidators.updateCartItemSchema), orderController.updateCartItem);
router.delete('/cart/items/:id', authenticate, validate(orderValidators.removeFromCartSchema), orderController.removeFromCart);
router.post('/cart/coupon', authenticate, validate(orderValidators.applyCouponSchema), orderController.applyCoupon);
router.post('/checkout', authenticate, validate(orderValidators.checkoutSchema), orderController.checkout);
router.get('/orders', authenticate, validate(orderValidators.getUserOrdersSchema), orderController.getUserOrders);
router.get('/orders/:id', authenticate, validate(orderValidators.getOrderByIdSchema), orderController.getOrderById);
router.put('/orders/:id/cancel', authenticate, validate(orderValidators.cancelOrderSchema), orderController.cancelOrder);
router.get('/orders/:id/track', authenticate, validate(orderValidators.getOrderByIdSchema), orderController.getOrderTracking);
router.get('/orders/:id/invoice', authenticate, validate(orderValidators.getOrderByIdSchema), orderController.getOrderInvoice);
router.get('/admin/orders', authenticate, requireAdmin, validate(orderValidators.getAllOrdersSchema), orderController.getAllOrders);
router.put('/admin/orders/:id/status', authenticate, requireAdmin, validate(orderValidators.updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;