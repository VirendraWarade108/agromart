import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Payment Service - DB-backed Implementation
 * Simulates payment processing with database persistence
 */

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
  const clientSecret = `${paymentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

  // Create payment intent in database
  const intent = await prisma.paymentIntent.create({
    data: {
      paymentId,
      orderId,
      amount,
      status: 'pending',
      clientSecret,
    },
  });

  // Update order status to processing
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'processing' },
  });

  return {
    paymentId: intent.paymentId,
    clientSecret: intent.clientSecret,
    status: intent.status,
    amount: intent.amount,
  };
};

/**
 * Verify payment
 * Simulates payment verification after user completes payment
 */
export const verifyPayment = async (paymentId: string, orderId: string) => {
  // Get payment intent from database
  const intent = await prisma.paymentIntent.findUnique({
    where: { paymentId },
  });

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
    await prisma.paymentIntent.update({
      where: { paymentId },
      data: { status: 'succeeded' },
    });

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
    await prisma.paymentIntent.update({
      where: { paymentId },
      data: { status: 'failed' },
    });

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
  const paymentIntent = await prisma.paymentIntent.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' }, // Get most recent
  });

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
    paymentId: paymentIntent.paymentId,
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

  // Update payment intent status
  await prisma.paymentIntent.updateMany({
    where: { orderId },
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