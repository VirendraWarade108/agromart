'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart, LayoutGrid, List, Mic, X, Package, TrendingUp } from 'lucide-react';

const categoryData: Record<string, { name: string; icon: string; description: string }> = {
  seeds: { name: 'Seeds', icon: '🌱', description: 'High-quality seeds for all seasons' },
  fertilizers: { name: 'Fertilizers', icon: '🧪', description: 'Organic and chemical fertilizers' },
  equipment: { name: 'Equipment', icon: '🚜', description: 'Modern farming equipment' },
  pesticides: { name: 'Pesticides', icon: '🛡️', description: 'Effective pest control solutions' },
  irrigation: { name: 'Irrigation', icon: '💧', description: 'Smart irrigation systems' },
  tools: { name: 'Tools', icon: '🔧', description: 'Essential farming tools' }
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 100000]);

  const category = categoryData[params.slug] || { name: 'Category', icon: '📦', description: 'Products' };

  const products = [
    { id: 1, name: 'Premium Hybrid Seeds - Tomato', price: 2499, originalPrice: 3124, rating: 4.8, reviews: 234, image: '🍅', inStock: true, discount: 20, sales: 1200 },
    { id: 2, name: 'Organic NPK Fertilizer', price: 1899, originalPrice: 2234, rating: 4.9, reviews: 456, image: '🌿', inStock: true, discount: 15, sales: 890 },
    { id: 3, name: 'Power Tiller - 8HP', price: 45999, originalPrice: 51110, rating: 4.6, reviews: 89, image: '⚙️', inStock: true, discount: 10, sales: 320 },
    { id: 4, name: 'Bio Pesticide Spray', price: 799, originalPrice: 999, rating: 4.5, reviews: 567, image: '🛡️', inStock: true, discount: 20, sales: 980 },
    { id: 5, name: 'Drip Irrigation Kit', price: 8999, originalPrice: 11999, rating: 4.7, reviews: 123, image: '💦', inStock: true, discount: 25, sales: 650 },
    { id: 6, name: 'Garden Tool Set', price: 1499, originalPrice: 1999, rating: 4.7, reviews: 345, image: '🔧', inStock: true, discount: 25, sales: 720 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute w-96 h-96 bg-green-500/30 rounded-full blur-3xl top-20 left-10 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl bottom-20 right-10 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/20 backdrop-blur-xl border-2 border-green-400/40 mb-6 shadow-lg">
              <Package className="w-5 h-5 text-green-300" />
              <span className="text-green-100 font-bold text-sm">CATEGORY</span>
            </div>

            <div className="text-9xl mb-6">{category.icon}</div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
              {category.name}
            </h1>
            <p className="text-xl text-gray-200 font-medium max-w-3xl mx-auto mb-8">
              {category.description}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60"></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <Search className="absolute left-6 w-6 h-6 text-gray-500" />
                  <input
                    type="text"
                    placeholder={`Search ${category.name.toLowerCase()}...`}
                    className="w-full pl-16 pr-48 py-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none text-lg font-medium"
                  />
                  <div className="flex items-center gap-2 mr-2">
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" title="Voice Search">
                      <Mic className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: `${products.length} Products`, icon: Package },
              { label: 'Free Delivery', icon: TrendingUp }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border-2 border-white/20 text-center"
              >
                <stat.icon className="w-6 h-6 text-green-300 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6 sticky top-24"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-6 h-6 text-green-600" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-bold text-lg">₹{priceRange[0]}</span>
                    <span className="text-gray-700 font-bold text-lg">₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
              </div>

              {/* Stock & Rating */}
              <div className="space-y-4 mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 text-green-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-green-500" defaultChecked />
                  <span className="text-gray-700 font-bold group-hover:text-green-600">In Stock Only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 text-green-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-green-500" />
                  <span className="text-gray-700 font-bold group-hover:text-green-600">4★ & Above</span>
                </label>
              </div>

              {/* Reset Filters */}
              <button className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg">
                Reset All Filters
              </button>
            </motion.div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-4 mb-6"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </button>
                  <p className="text-gray-700 font-bold text-lg">
                    <span className="text-green-600">{products.length}</span> Products Found
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-green-400 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid' ? 'bg-white shadow-md text-green-600' : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list' ? 'bg-white shadow-md text-green-600' : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products Grid/List */}
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-400 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-red-600 text-white text-sm font-black rounded-lg shadow-lg">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button className="absolute top-16 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all group/heart">
                    <Heart className="w-5 h-5 text-gray-400 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-all" />
                  </button>

                  {/* Product Image */}
                  <Link 
                    href={`/products/${product.id}`}
                    className={`${viewMode === 'list' ? 'w-64' : 'w-full'} bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex items-center justify-center hover:scale-105 transition-transform`}
                  >
                    <div className="text-8xl drop-shadow-lg">{product.image}</div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6 flex-1">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-black text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-bold">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-black text-green-600">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-base text-gray-400 line-through font-bold">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {product.inStock ? (
                      <p className="text-sm text-green-600 font-black mb-4 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        ✓ In Stock
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 font-black mb-4 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        ⚠️ Out of Stock
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        disabled={!product.inStock}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          product.inStock
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:scale-105'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </div>

                    {/* Sales Badge */}
                    <div className="pt-4 border-t-2 border-gray-100">
                      <p className="text-sm text-gray-600 font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        {product.sales}+ sold this month
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}