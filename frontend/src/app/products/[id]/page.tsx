'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, CheckCircle, Minus, Plus, Share2, MessageCircle, TrendingUp, Package, Award, Clock, ChevronLeft } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const product = {
    id: params.id,
    name: 'Premium Hybrid Seeds - Tomato',
    category: 'Seeds',
    price: 2499,
    originalPrice: 3124,
    discount: 20,
    rating: 4.8,
    reviews: 234,
    inStock: true,
    stockCount: 45,
    images: ['🍅', '🌱', '📦', '🌿'],
    shortDescription: 'High-yield hybrid tomato seeds perfect for all seasons. Disease-resistant variety with excellent fruit quality.',
    description: 'Our Premium Hybrid Tomato Seeds are specially selected for Indian farming conditions. These seeds produce high-quality tomatoes with excellent taste, size, and shelf life. The variety is resistant to common diseases and pests, making it ideal for both commercial and home gardening.',
    features: [
      'High germination rate of 95%+',
      'Disease and pest resistant',
      'Suitable for all seasons',
      'Average yield: 25-30 tons per acre',
      'Fruit weight: 80-100 grams',
      'Maturity period: 65-70 days'
    ],
    specifications: {
      'Brand': 'AgroMart Premium',
      'Seed Type': 'Hybrid F1',
      'Pack Size': '100 grams',
      'Germination': '95%+',
      'Validity': '12 months',
      'Origin': 'India',
      'Certification': 'ISO 9001:2015'
    },
    tags: ['Bestseller', 'Premium Quality', 'High Yield', 'Disease Resistant']
  };

  const reviews = [
    { id: 1, name: 'Rajesh Kumar', rating: 5, date: '2 weeks ago', comment: 'Excellent seeds! Got 95% germination rate. Highly recommended for commercial farming.', verified: true, avatar: '👨‍🌾' },
    { id: 2, name: 'Priya Sharma', rating: 5, date: '1 month ago', comment: 'Best quality tomato seeds. Plants are healthy and producing good yield.', verified: true, avatar: '👩‍🌾' },
    { id: 3, name: 'Anil Patel', rating: 4, date: '1 month ago', comment: 'Good quality seeds. Fast delivery. Worth the price.', verified: true, avatar: '👨' }
  ];

  const relatedProducts = [
    { id: 2, name: 'Organic Fertilizer Pro', price: 1899, rating: 4.9, image: '🌿', discount: 15 },
    { id: 3, name: 'Bio Pesticide Spray', price: 799, rating: 4.7, image: '🛡️', discount: 20 },
    { id: 4, name: 'Drip Irrigation Kit', price: 8999, rating: 4.8, image: '💦', discount: 25 },
    { id: 5, name: 'Garden Tool Set', price: 1499, rating: 4.6, image: '🔧', discount: 10 }
  ];

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product.stockCount));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link>
            <span className="text-gray-600">/</span>
            <Link href={`/categories/${product.category.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors">{product.category}</Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all mb-8">
          <ChevronLeft className="w-5 h-5" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl p-16 flex items-center justify-center shadow-2xl">
                <div className="text-9xl">{product.images[selectedImage]}</div>
                
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-red-600 text-white text-lg font-black rounded-xl shadow-lg">
                    -{product.discount}% OFF
                  </div>
                )}
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`p-6 bg-white rounded-2xl border-2 transition-all ${
                    selectedImage === idx 
                      ? 'border-green-500 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-4xl text-center">{img}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-bold rounded-lg border border-green-400/30">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="text-xl font-black text-gray-900">{product.rating}</span>
              </div>
              <span className="text-gray-300 font-semibold">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-green-400">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through font-bold">₹{product.originalPrice}</span>
                )}
              </div>
              <p className="text-gray-300 font-semibold">Inclusive of all taxes</p>
            </div>

            {/* Short Description */}
            <p className="text-xl text-gray-200 mb-8 leading-relaxed font-medium">
              {product.shortDescription}
            </p>

            {/* Stock Status */}
            {product.inStock ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border-2 border-green-400/40 rounded-xl mb-8">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-bold">In Stock ({product.stockCount} units available)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border-2 border-red-400/40 rounded-xl mb-8">
                <span className="text-red-300 font-bold">Out of Stock</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-white font-bold text-lg mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 shadow-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-4 hover:bg-gray-100 transition-colors rounded-l-xl"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5 text-gray-900" />
                  </button>
                  <span className="px-8 text-2xl font-black text-gray-900">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-4 hover:bg-gray-100 transition-colors rounded-r-xl"
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="w-5 h-5 text-gray-900" />
                  </button>
                </div>
                <span className="text-gray-300 font-semibold">
                  Total: <span className="text-white font-black text-xl">₹{product.price * quantity}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="flex-1 py-5 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-lg rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button className="py-5 px-8 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                <Heart className="w-6 h-6" />
              </button>
              <button className="py-5 px-8 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Truck, text: 'Free Delivery', color: 'from-blue-500 to-cyan-500' },
                { icon: Shield, text: '100% Genuine', color: 'from-green-500 to-emerald-500' },
                { icon: RotateCcw, text: '7 Day Return', color: 'from-purple-500 to-pink-500' },
                { icon: Award, text: 'Top Quality', color: 'from-yellow-500 to-orange-500' }
              ].map((badge, idx) => (
                <div key={idx} className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <badge.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b-2 border-gray-200 bg-gray-50">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 font-bold text-lg capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-white text-green-600 border-b-4 border-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <p className="text-gray-700 text-lg leading-relaxed font-medium">{product.description}</p>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">Key Features</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <span className="text-gray-700 font-semibold">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-900">{key}</span>
                      <span className="text-gray-700 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <div className="text-center">
                      <div className="text-6xl font-black text-gray-900 mb-2">{product.rating}</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <p className="text-gray-600 font-semibold">{product.reviews} reviews</p>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3 mb-2">
                          <span className="text-gray-700 font-semibold w-8">{stars}★</span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${stars * 20}%` }}></div>
                          </div>
                          <span className="text-gray-600 font-semibold w-12 text-right">{stars * 20}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{review.avatar}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{review.name}</h4>
                                {review.verified && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm font-semibold">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-4xl font-black text-white mb-8">Related Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 text-center">
                  <div className="text-7xl mb-4">{item.image}</div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-green-600">₹{item.price}</span>
                    {item.discount > 0 && (
                      <span className="text-sm px-2 py-1 bg-red-100 text-red-600 font-bold rounded">
                        -{item.discount}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}