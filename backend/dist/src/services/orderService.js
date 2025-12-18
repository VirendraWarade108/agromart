"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderInvoice = exports.cancelOrder = exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const cartService_1 = require("./cartService");
/**
 * ✅ FIXED: Calculate shipping fee
 * Free shipping for orders >= ₹5000, otherwise ₹200
 */
const calculateShipping = (subtotal) => {
    const FREE_SHIPPING_THRESHOLD = 5000;
    const STANDARD_SHIPPING_FEE = 200;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
};
/**
 * ✅ FIXED: Calculate tax (18% GST)
 * Tax is applied on (subtotal - discount)
 */
const calculateTax = (subtotal, discount) => {
    const GST_RATE = 0.18; // 18% GST
    const taxableAmount = subtotal - discount;
    return Math.round(taxableAmount * GST_RATE * 100) / 100;
};
/**
 * Create order from cart (Checkout)
 */
const createOrder = async (userId, data) => {
    // Get user's cart
    const cart = await (0, cartService_1.getCart)(userId);
    if (!cart.items || cart.items.length === 0) {
        throw new errorHandler_1.AppError('Cart is empty', 400);
    }
    // Validate stock for all items
    for (const item of cart.items) {
        if (!item.product.stock || item.product.stock < item.quantity) {
            throw new errorHandler_1.AppError(`Product "${item.product.name}" is out of stock`, 400);
        }
    }
    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    // ✅ FIXED: Apply coupon discount if provided
    // TODO: Implement full coupon validation when coupon system is added
    const couponDiscount = 0; // Placeholder for now
    // ✅ FIXED: Calculate shipping based on subtotal
    const shippingFee = calculateShipping(subtotal);
    // ✅ FIXED: Calculate tax (18% GST on taxable amount)
    const tax = calculateTax(subtotal, couponDiscount);
    // Calculate final total
    const total = subtotal - couponDiscount + shippingFee + tax;
    // Prepare coupon data
    const couponData = data.couponCode
        ? {
            code: data.couponCode,
            discount: couponDiscount,
        }
        : undefined;
    // Create order
    const order = await database_1.default.order.create({
        data: {
            userId,
            total,
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
        await database_1.default.product.update({
            where: { id: item.productId },
            data: {
                stock: {
                    decrement: item.quantity,
                },
            },
        });
    }
    // Clear cart
    await (0, cartService_1.clearCart)(userId);
    return order;
};
exports.createOrder = createOrder;
/**
 * Get user's orders
 */
const getUserOrders = async (userId, options = {}) => {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;
    const where = { userId };
    if (status) {
        where.status = status;
    }
    const [orders, total] = await Promise.all([
        database_1.default.order.findMany({
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
        database_1.default.order.count({ where }),
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
exports.getUserOrders = getUserOrders;
/**
 * Get single order by ID
 */
const getOrderById = async (orderId, userId) => {
    const order = await database_1.default.order.findUnique({
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
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // If userId provided, verify order belongs to user (unless admin check is needed)
    if (userId && order.userId !== userId) {
        throw new errorHandler_1.AppError('Unauthorized to view this order', 403);
    }
    return order;
};
exports.getOrderById = getOrderById;
/**
 * Get all orders (Admin only)
 */
const getAllOrders = async (options = {}) => {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;
    const where = {};
    if (status) {
        where.status = status;
    }
    const [orders, total] = await Promise.all([
        database_1.default.order.findMany({
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
        database_1.default.order.count({ where }),
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
exports.getAllOrders = getAllOrders;
/**
 * Update order status (Admin only)
 */
const updateOrderStatus = async (orderId, status) => {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new errorHandler_1.AppError('Invalid order status', 400);
    }
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    const updatedOrder = await database_1.default.order.update({
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
exports.updateOrderStatus = updateOrderStatus;
/**
 * Cancel order
 */
const cancelOrder = async (orderId, userId) => {
    const order = await database_1.default.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Verify order belongs to user
    if (order.userId !== userId) {
        throw new errorHandler_1.AppError('Unauthorized to cancel this order', 403);
    }
    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
        throw new errorHandler_1.AppError('Cannot cancel order at this stage', 400);
    }
    // Update status to cancelled
    const updatedOrder = await database_1.default.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
    });
    // Restore product stock
    for (const item of order.items) {
        await database_1.default.product.update({
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
exports.cancelOrder = cancelOrder;
/**
 * Get order invoice
 * GET /api/orders/:id/invoice
 */
const getOrderInvoice = async (orderId, userId) => {
    // Get order with full details
    const order = await database_1.default.order.findUnique({
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
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    // Verify order belongs to user
    if (order.userId !== userId) {
        throw new errorHandler_1.AppError('Unauthorized to view this invoice', 403);
    }
    // Calculate invoice details
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Extract coupon discount from order.coupon JSON field
    const couponDiscount = order.coupon && typeof order.coupon === 'object' && 'discount' in order.coupon
        ? order.coupon.discount
        : 0;
    // ✅ FIXED: Calculate tax using the same logic as order creation
    const tax = calculateTax(subtotal, couponDiscount);
    // ✅ FIXED: Calculate shipping using the same logic as order creation
    const shippingFee = calculateShipping(subtotal);
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
exports.getOrderInvoice = getOrderInvoice;
