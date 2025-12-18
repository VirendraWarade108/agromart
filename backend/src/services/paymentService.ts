import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Payment Service - Mock Implementation
 * This is a simplified payment service that simulates payment processing
 * without integrating with real payment gateways
 */

interface PaymentIntent {
  id: string;
  amount: number;
  orderId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  createdAt: Date;
}

// In-memory store for payment intents (in production, use database)
const paymentIntents = new Map<string, PaymentIntent>();

/**
 * Create payment intent
 * Simulates creating a payment session with a payment provider
 */
export const createPaymentIntent = async (amount: number, orderId: string) => {
  // Validate order exists
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Validate amount matches order total
  if (Math.abs(order.total - amount) > 0.01) {
    throw new AppError('Payment amount does not match order total', 400);
  }

  // Generate mock payment intent ID
  const paymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create payment intent
  const intent: PaymentIntent = {
    id: paymentId,
    amount,
    orderId,
    status: 'pending',
    createdAt: new Date(),
  };

  // Store in memory
  paymentIntents.set(paymentId, intent);

  // Update order status to processing
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'processing' },
  });

  return {
    paymentId,
    clientSecret: `${paymentId}_secret_${Math.random().toString(36).substr(2, 9)}`,
    status: intent.status,
    amount: intent.amount,
  };
};

/**
 * Verify payment
 * Simulates payment verification after user completes payment
 */
export const verifyPayment = async (paymentId: string, orderId: string) => {
  // Get payment intent
  const intent = paymentIntents.get(paymentId);

  if (!intent) {
    throw new AppError('Payment intent not found', 404);
  }

  // Validate order ID matches
  if (intent.orderId !== orderId) {
    throw new AppError('Payment does not match order', 400);
  }

  // Validate order exists
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Simulate payment processing
  // In real implementation, this would verify with payment provider
  const isSuccess = Math.random() > 0.1; // 90% success rate for testing

  if (isSuccess) {
    // Update payment intent status
    intent.status = 'succeeded';
    paymentIntents.set(paymentId, intent);

    // Update order status to paid
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid' },
    });

    return {
      success: true,
      paymentId,
      status: 'succeeded',
      message: 'Payment verified successfully',
    };
  } else {
    // Payment failed
    intent.status = 'failed';
    paymentIntents.set(paymentId, intent);

    // Update order status to failed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'failed' },
    });

    throw new AppError('Payment verification failed', 400);
  }
};

/**
 * Get payment status
 * Check the current status of a payment for an order
 */
export const getPaymentStatus = async (orderId: string) => {
  // Validate order exists
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Find payment intent for this order
  let paymentIntent: PaymentIntent | undefined;
  for (const [, intent] of paymentIntents.entries()) {
    if (intent.orderId === orderId) {
      paymentIntent = intent;
      break;
    }
  }

  if (!paymentIntent) {
    return {
      orderId,
      orderStatus: order.status,
      paymentStatus: 'no_payment',
      message: 'No payment initiated for this order',
    };
  }

  return {
    orderId,
    orderStatus: order.status,
    paymentId: paymentIntent.id,
    paymentStatus: paymentIntent.status,
    amount: paymentIntent.amount,
    createdAt: paymentIntent.createdAt,
  };
};

/**
 * Process refund (Admin only)
 * Simulates refunding a payment
 */
export const processRefund = async (orderId: string, amount?: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Can only refund paid orders
  if (order.status !== 'paid' && order.status !== 'delivered') {
    throw new AppError('Order cannot be refunded in current status', 400);
  }

  const refundAmount = amount || order.total;

  if (refundAmount > order.total) {
    throw new AppError('Refund amount cannot exceed order total', 400);
  }

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'refunded' },
  });

  // Generate refund ID
  const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    refundId,
    orderId,
    amount: refundAmount,
    status: 'succeeded',
    message: 'Refund processed successfully',
  };
};