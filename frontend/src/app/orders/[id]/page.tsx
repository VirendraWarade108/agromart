'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Package, MapPin, CreditCard, Truck, Clock, 
  CheckCircle, Download, Phone, Mail, XCircle, AlertCircle 
} from 'lucide-react';
import { orderApi, handleApiError } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/store/uiStore';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { formatPrice, formatDate } from '@/lib/utils';
import AuthGuard from '@/components/shared/AuthGuard';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: any;
  trackingNumber?: string;
  createdAt: string;
  deliveredAt?: string;
}

interface TrackingEvent {
  status: string;
  message: string;
  timestamp: string;
  location?: string;
}

function OrderDetailsContent({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await orderApi.getById(params.id);
      
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to load order details');
      
      // Mock data for development
      setOrder({
        id: params.id,
        orderNumber: 'ORD-2024-001',
        items: [
          {
            id: '1',
            productId: 'p1',
            name: 'Premium Hybrid Seeds - Tomato',
            image: '🍅',
            quantity: 2,
            price: 2499,
          },
          {
            id: '2',
            productId: 'p2',
            name: 'Organic NPK Fertilizer',
            image: '🌿',
            quantity: 1,
            price: 1899,
          },
        ],
        subtotal: 6897,
        discount: 689,
        shipping: 0,
        tax: 0,
        total: 6208,
        status: 'shipped',
        paymentMethod: 'card',
        paymentStatus: 'completed',
        shippingAddress: {
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          addressLine1: 'Plot No. 45, Village Rampur',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          pincode: '226001',
        },
        trackingNumber: 'TRK123456789',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    try {
      await orderApi.cancel(params.id);
      showSuccessToast('Order cancelled successfully');
      fetchOrderDetails();
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await orderApi.getInvoice(params.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccessToast('Invoice downloaded');
    } catch (error) {
      showErrorToast('Failed to download invoice');
    }
  };

  const getStatusDisplay = (status: string) => {
    const displays: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'from-yellow-500 to-orange-600', icon: Clock, label: 'Pending' },
      confirmed: { color: 'from-blue-500 to-cyan-600', icon: CheckCircle, label: 'Confirmed' },
      processing: { color: 'from-purple-500 to-pink-600', icon: Package, label: 'Processing' },
      shipped: { color: 'from-indigo-500 to-blue-600', icon: Truck, label: 'Shipped' },
      delivered: { color: 'from-green-500 to-emerald-600', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'from-red-500 to-rose-600', icon: XCircle, label: 'Cancelled' },
    };
    return displays[status] || displays.pending;
  };

  const trackingTimeline: TrackingEvent[] = [
    { status: 'placed', message: 'Order placed', timestamp: order?.createdAt || '', location: 'Lucknow, UP' },
    { status: 'confirmed', message: 'Order confirmed', timestamp: order?.createdAt || '', location: 'Lucknow, UP' },
    { status: 'processing', message: 'Order is being processed', timestamp: order?.createdAt || '', location: 'Warehouse' },
    { status: 'shipped', message: 'Order shipped', timestamp: order?.createdAt || '', location: 'In Transit' },
  ];

  if (isLoading) {
    return <PageLoader message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Order Not Found</h2>
          <p className="text-gray-300 font-semibold mb-8">This order doesn't exist or you don't have access to it.</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order.status);
  const StatusIcon = statusDisplay.icon;
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-bold mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white">Order {order.orderNumber}</h1>
              <p className="text-gray-300 font-semibold mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {order.status === 'delivered' && (
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Invoice
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-xl transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
              <div className={`w-20 h-20 bg-gradient-to-br ${statusDisplay.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <StatusIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 text-center mb-2">
                Order {statusDisplay.label}
              </h2>
              {order.trackingNumber && (
                <p className="text-center text-gray-600 font-semibold">
                  Tracking: <span className="font-black text-gray-900">{order.trackingNumber}</span>
                </p>
              )}
            </div>

            {/* Tracking Timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Order Tracking</h3>
                <div className="space-y-6">
                  {trackingTimeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          idx <= 2 ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        {idx < trackingTimeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${idx < 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-bold text-gray-900 mb-1">{event.message}</p>
                        <p className="text-sm text-gray-600 font-semibold">{formatDate(event.timestamp)}</p>
                        {event.location && (
                          <p className="text-sm text-gray-500 font-medium">{event.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center text-4xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-bold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 font-semibold">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-semibold">Discount</span>
                    <span className="font-bold">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Shipping</span>
                  <span className={`font-bold ${order.shipping === 0 ? 'text-green-600' : ''}`}>
                    {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-gray-900">Total</span>
                  <span className="text-2xl font-black text-green-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-600" />
                Shipping Address
              </h3>
              <div className="space-y-2 text-gray-700 font-semibold">
                <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>PIN: {order.shippingAddress.pincode}</p>
                <p className="flex items-center gap-2 pt-2">
                  <Phone className="w-4 h-4" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-green-600" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Payment Method</p>
                  <p className="font-bold text-gray-900 capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                    order.paymentStatus === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentStatus === 'completed' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-700 font-semibold mb-4">
                Contact our customer support for any queries about your order.
              </p>
              <div className="space-y-2">
                <a
                  href="tel:18001234567"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm"
                >
                  <Phone className="w-4 h-4" />
                  1800-123-4567
                </a>
                <a
                  href="mailto:support@agromart.com"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm"
                >
                  <Mail className="w-4 h-4" />
                  support@agromart.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <OrderDetailsContent params={params} />
    </AuthGuard>
  );
}