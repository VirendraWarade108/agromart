'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck, Shield, Gift, X, ChevronLeft, Package } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Premium Hybrid Seeds - Tomato', price: 2499, quantity: 2, image: '🍅', inStock: true, category: 'Seeds' },
    { id: 2, name: 'Organic Fertilizer Pro - NPK', price: 1899, quantity: 1, image: '🌿', inStock: true, category: 'Fertilizers' },
    { id: 3, name: 'Smart Irrigation Kit', price: 8999, quantity: 1, image: '💦', inStock: true, category: 'Irrigation' }
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'save10') {
      setAppliedCoupon('SAVE10');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? subtotal * 0.1 : 0;
  const shipping = subtotal > 5000 ? 0 : 200;
  const total = subtotal - discount + shipping;

  const suggestedProducts = [
    { id: 4, name: 'Bio Pesticide Spray', price: 799, image: '🛡️', discount: 20 },
    { id: 5, name: 'Garden Tools Set', price: 1499, image: '🔧', discount: 25 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/products" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <ChevronLeft className="w-6 h-6 text-white" />
              </a>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-green-400" />
                  Shopping Cart
                </h1>
                <p className="text-gray-300 font-semibold mt-1">{cartItems.length} items in your cart</p>
              </div>
            </div>
            <a href="/products" className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Your Cart is Empty</h2>
            <p className="text-gray-300 text-lg mb-8 font-medium">Add some products to get started!</p>
            <a href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all">
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Truck, text: 'Free Delivery', subtext: 'On orders ₹5000+' },
                  { icon: Shield, text: '100% Secure', subtext: 'Payment protected' },
                  { icon: Gift, text: 'Special Offers', subtext: 'Save more today' }
                ].map((badge, idx) => (
                  <div key={idx} className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-center">
                    <badge.icon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">{badge.text}</p>
                    <p className="text-gray-400 text-xs font-semibold">{badge.subtext}</p>
                  </div>
                ))}
              </div>

              {/* Cart Items List */}
              {cartItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative group bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden hover:border-green-400 transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-6 p-6">
                    {/* Product Image */}
                    <a href={`/products/${item.id}`} className="w-full sm:w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform">
                      <div className="text-6xl">{item.image}</div>
                    </a>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <a href={`/products/${item.id}`} className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors mb-1 block">
                            {item.name}
                          </a>
                          <p className="text-sm text-gray-600 font-semibold">Category: {item.category}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Stock Status */}
                      {item.inStock ? (
                        <p className="text-sm text-green-600 font-bold mb-4">✓ In Stock</p>
                      ) : (
                        <p className="text-sm text-red-600 font-bold mb-4">⚠️ Out of Stock</p>
                      )}

                      {/* Quantity & Price */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-100 rounded-xl border-2 border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-3 hover:bg-gray-200 transition-colors rounded-l-xl"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-gray-900" />
                          </button>
                          <span className="px-6 text-lg font-black text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-3 hover:bg-gray-200 transition-colors rounded-r-xl"
                          >
                            <Plus className="w-4 h-4 text-gray-900" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-600 font-semibold">₹{item.price} × {item.quantity}</p>
                          <p className="text-2xl font-black text-green-600">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Suggested Products */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  You Might Also Like
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {suggestedProducts.map((product) => (
                    <a
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                        <div className="text-3xl">{product.image}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-green-600 transition-colors truncate">
                          {product.name}
                        </h4>
                        <p className="text-lg font-black text-green-600">₹{product.price}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-2xl p-6 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Apply Coupon Code</label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700">{appliedCoupon} Applied!</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-green-700" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 font-semibold"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2 font-semibold">Try code: SAVE10 for 10% off</p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-semibold">Subtotal ({cartItems.length} items)</span>
                    <span className="font-bold">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-semibold">Discount (10%)</span>
                      <span className="font-bold">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span className="font-semibold">Shipping</span>
                    <span className="font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-orange-600 font-bold bg-orange-50 p-2 rounded-lg">
                      Add ₹{5000 - subtotal} more for FREE delivery!
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="pt-6 border-t-2 border-gray-200 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-gray-900">Total</span>
                    <span className="text-3xl font-black text-green-600">₹{total}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold mt-1">Inclusive of all taxes</p>
                </div>

                {/* Checkout Button */}
                <a
                  href="/checkout"
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-lg rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 mb-4"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </a>

                <a
                  href="/products"
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Continue Shopping
                </a>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">100% Secure Checkout</p>
                  <p className="text-xs text-gray-600 font-semibold">SSL Encrypted Payment</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}