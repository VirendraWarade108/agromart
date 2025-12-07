'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  Upload,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { productApi, handleApiError } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/store/uiStore';
import { PageLoader, TableSkeleton } from '@/components/shared/LoadingSpinner';
import { formatPrice, formatDate } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  isFeatured: boolean;
  createdAt: string;
  thumbnail?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 100 };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await productApi.getAll(params);
      
      if (response.data.success) {
        // Handle both array and paginated response
        const data = response.data.data;
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      // In real app, this would call adminApi.deleteProduct(id)
      showSuccessToast(`Product "${name}" deleted successfully`);
      fetchProducts();
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Delete Failed');
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      // In real app, this would call adminApi.updateProduct(id, { isFeatured: !currentStatus })
      showSuccessToast(`Product ${!currentStatus ? 'added to' : 'removed from'} featured`);
      fetchProducts();
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Update Failed');
    }
  };

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'seeds', name: 'Seeds' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'tools', name: 'Tools' },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-64 bg-white/10 rounded-xl animate-pulse mb-2"></div>
            <div className="h-6 w-96 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
          <TableSkeleton rows={10} cols={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-green-400" />
              Products Management
            </h1>
            <p className="text-gray-300 font-semibold mt-1">
              Manage your product inventory ({filteredProducts.length} products)
            </p>
          </div>
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 font-semibold text-gray-900"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 font-bold text-gray-900 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="p-3 border-2 border-gray-200 hover:border-green-400 rounded-xl font-bold text-gray-900 transition-all">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-3 border-2 border-gray-200 hover:border-green-400 rounded-xl font-bold text-gray-900 transition-all">
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-black text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-600 font-bold">No products found</p>
                        <p className="text-gray-500 text-sm font-semibold">
                          {searchQuery ? 'Try different search terms' : 'Add your first product to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🌱</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-600 font-semibold">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-black text-gray-900">{formatPrice(product.price)}</p>
                          {product.originalPrice && (
                            <p className="text-sm text-gray-500 line-through font-semibold">
                              {formatPrice(product.originalPrice)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{product.stockCount} units</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {product.inStock ? (
                          <span className="flex items-center gap-2 text-green-600 font-bold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            In Stock
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600 font-bold text-sm">
                            <XCircle className="w-4 h-4" />
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{product.rating}</span>
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600 font-semibold">
                            ({product.reviews})
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Product"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </Link>
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-5 h-5 text-blue-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Products', value: products.length, color: 'text-blue-600' },
            { label: 'In Stock', value: products.filter(p => p.inStock).length, color: 'text-green-600' },
            { label: 'Out of Stock', value: products.filter(p => !p.inStock).length, color: 'text-red-600' },
            { label: 'Featured', value: products.filter(p => p.isFeatured).length, color: 'text-purple-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 text-center">
              <p className="text-gray-600 font-bold text-sm mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}