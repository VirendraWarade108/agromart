import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as cartService from '../services/cartService';
import * as orderService from '../services/orderService';

// ============================================
// CART CONTROLLERS
// ============================================

/**
 * Get user's cart
 * GET /api/cart
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const cart = await cartService.getCart(userId);

  res.json({
    success: true,
    data: {
      items: cart.items,
      coupon: null, // TODO: Implement coupon system
    },
  });
});

/**
 * Add item to cart
 * POST /api/cart/add
 */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  const cart = await cartService.addToCart(userId, productId, quantity);

  res.json({
    success: true,
    message: 'Item added to cart',
    data: {
      items: cart.items,
      coupon: null,
    },
  });
});

/**
 * Update cart item quantity
 * PUT /api/cart/items/:productId
 */
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required',
      });
    }

    const cart = await cartService.updateCartItem(userId, productId, quantity);

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        items: cart.items,
        coupon: null,
      },
    });
  }
);

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(userId, productId);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: cart.items,
        coupon: null,
      },
    });
  }
);

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const cart = await cartService.clearCart(userId);

  res.json({
    success: true,
    message: 'Cart cleared',
    data: {
      items: cart.items,
      coupon: null,
    },
  });
});

// ============================================
// ORDER CONTROLLERS
// ============================================

/**
 * Create order (Checkout)
 * POST /api/checkout
 */
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  const order = await orderService.createOrder(userId, {
    shippingAddress,
    paymentMethod,
    couponCode,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order },
  });
});

/**
 * Get user's orders
 * GET /api/orders
 */
export const getUserOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { page, limit, status } = req.query;

    const result = await orderService.getUserOrders(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
    });

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  }
);

/**
 * Get single order
 * GET /api/orders/:id
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const order = await orderService.getOrderById(id, userId);

    res.json({
      success: true,
      data: order,
    });
  }
);

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const order = await orderService.cancelOrder(id, userId);

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

// ============================================
// ADMIN ORDER CONTROLLERS
// ============================================

/**
 * Get all orders (Admin only)
 * GET /api/admin/orders
 */
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, status } = req.query;

    const result = await orderService.getAllOrders({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
    });

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  }
);

/**
 * Update order status (Admin only)
 * PUT /api/admin/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    res.json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  }
);