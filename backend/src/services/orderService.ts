import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getCart, clearCart, calculateCartTotals } from './cartService';

/**
 * Create order from cart (Checkout)
 */
export const createOrder = async (
  userId: string,
  data: {
    shippingAddress?: any;
    paymentMethod?: string;
    couponCode?: string;
  }
) => {
  // Get user's cart
  const cart = await getCart(userId);

  if (!cart.items || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (!item.product.stock || item.product.stock < item.quantity) {
      throw new AppError(
        `Product "${item.product.name}" is out of stock`,
        400
      );
    }
  }

  // Calculate totals
  // TODO: Implement coupon validation when coupon system is added
  const couponDiscount = 0; // Placeholder
  const totals = calculateCartTotals(cart, couponDiscount);

  // Prepare coupon data
  const couponData = data.couponCode
    ? {
        code: data.couponCode,
        discount: couponDiscount,
      }
    : undefined;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      total: totals.total,
      status: 'pending',
      ...(couponData && { coupon: couponData }),
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true,
            },
          },
        },
      },
    },
  });

  // Update product stock
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }

  // Clear cart
  await clearCart(userId);

  return order;
};

/**
 * Get user's orders
 */
export const getUserOrders = async (
  userId: string,
  options: { page?: number; limit?: number; status?: string } = {}
) => {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId: string, userId?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // If userId provided, verify order belongs to user (unless admin check is needed)
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized to view this order', 403);
  }

  return order;
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (options: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) => {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return updatedOrder;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify order belongs to user
  if (order.userId !== userId) {
    throw new AppError('Unauthorized to cancel this order', 403);
  }

  // Can only cancel pending or processing orders
  if (!['pending', 'processing'].includes(order.status)) {
    throw new AppError('Cannot cancel order at this stage', 400);
  }

  // Update status to cancelled
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'cancelled' },
  });

  // Restore product stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }

  return updatedOrder;
};

/**
 * Get order invoice
 * GET /api/orders/:id/invoice
 */
export const getOrderInvoice = async (orderId: string, userId: string) => {
  // Get order with full details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify order belongs to user
  if (order.userId !== userId) {
    throw new AppError('Unauthorized to view this invoice', 403);
  }

  // Calculate invoice details
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Extract coupon discount from order.coupon JSON field
  const couponDiscount =
    order.coupon && typeof order.coupon === 'object' && 'discount' in order.coupon
      ? (order.coupon as any).discount
      : 0;

  const tax = 0; // TODO: Implement tax calculation if needed
  const shippingFee = 0; // TODO: Implement shipping fee if needed
  const total = order.total;

  // Build invoice response
  const invoice = {
    invoiceNumber: `INV-${order.id.slice(-8).toUpperCase()}`,
    orderNumber: order.id,
    invoiceDate: order.createdAt,
    dueDate: order.createdAt, // Same as invoice date for immediate payment
    status: order.status,

    // Customer details
    customer: {
      id: order.user.id,
      name: order.user.fullName,
      email: order.user.email,
      phone: order.user.phone || 'N/A',
    },

    // Line items
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.image,
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    })),

    // Financial summary
    summary: {
      subtotal,
      discount: couponDiscount,
      tax,
      shipping: shippingFee,
      total,
    },

    // Coupon info if applied
    ...(order.coupon && {
      coupon: order.coupon,
    }),

    // Company details (can be moved to config later)
    company: {
      name: 'AgroMart',
      address: 'Agricultural Market Complex, India',
      email: 'support@agromart.com',
      phone: '+91-1234567890',
      website: 'https://agromart.com',
    },
  };

  return invoice;
};