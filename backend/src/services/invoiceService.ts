import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Generate invoice data for an order
 */
export const generateInvoice = async (orderId: string, userId?: string) => {
  // Get order with all details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify user access (if userId provided)
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized to access this invoice', 403);
  }

  // Calculate subtotal
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Parse coupon data if exists
  let discount = 0;
  let couponCode = null;
  if (order.coupon && typeof order.coupon === 'object') {
    const couponData = order.coupon as any;
    couponCode = couponData.code || null;
    discount = couponData.discount || 0;
  }

  const shippingCharges = 0; // Free shipping for now
  const tax = 0; // Tax calculation can be added later
  const total = order.total;

  // Generate order number from ID (simplified version)
  const orderNumber = `ORD-${order.id.substring(0, 8).toUpperCase()}`;

  // Build invoice data
  const invoice = {
    invoiceNumber: `INV-${orderNumber}`,
    orderNumber: orderNumber,
    orderId: order.id,
    invoiceDate: new Date().toISOString(),
    orderDate: order.createdAt.toISOString(),
    
    // Customer details
    customer: {
      name: order.user.fullName,
      email: order.user.email,
      phone: order.user.phone || 'N/A',
    },
    
    // Note: Addresses are not stored in Order model in current schema
    // They would need to be added to Order model or fetched from user's saved addresses
    billingAddress: null,
    shippingAddress: null,
    
    // Order items
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      category: item.product.category?.name || 'Uncategorized',
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    })),
    
    // Payment details (payment info not in current Order model)
    paymentMethod: 'N/A', // Would need to be added to Order model
    paymentStatus: 'Completed', // Assumption based on order being created
    
    // Price breakdown
    pricing: {
      subtotal,
      discount,
      couponCode,
      shippingCharges,
      tax,
      total,
    },
    
    // Additional info
    status: order.status,
    notes: null, // Notes field not in current Order model
  };

  return invoice;
};

/**
 * Get invoice as JSON
 */
export const getInvoiceJSON = async (orderId: string, userId?: string) => {
  return await generateInvoice(orderId, userId);
};

/**
 * Get invoice as PDF (placeholder for future PDF generation)
 * For now, returns JSON with a note
 */
export const getInvoicePDF = async (orderId: string, userId?: string) => {
  const invoice = await generateInvoice(orderId, userId);
  
  // TODO: Integrate PDF generation library (e.g., pdfkit, puppeteer)
  // For now, return invoice data with instructions
  return {
    ...invoice,
    format: 'json',
    note: 'PDF generation will be implemented in future update. Use this JSON data to generate PDF on frontend if needed.',
  };
};