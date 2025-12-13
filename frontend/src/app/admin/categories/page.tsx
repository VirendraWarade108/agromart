'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { adminApi, handleApiError } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/store/uiStore';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { AdminGuard } from '@/components/shared/AuthGuard';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Mock data for demo
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCategories([
        {
          id: '1',
          name: 'Seeds',
          icon: '🌾',
          description: 'High-quality seeds for various crops',
          productCount: 45,
        },
        {
          id: '2',
          name: 'Fertilizers',
          icon: '🌱',
          description: 'Organic and chemical fertilizers',
          productCount: 32,
        },
        {
          id: '3',
          name: 'Tools',
          icon: '🛠️',
          description: 'Farm tools and equipment',
          productCount: 28,
        },
      ]);
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId('new');
    setFormData({ name: '', description: '', icon: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId === 'new') {
        const response = await adminApi.createCategory({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        if (response?.data?.success) {
          await fetchCategories();
          showSuccessToast('Category added successfully');
        }
      } else if (editingId) {
        const response = await adminApi.updateCategory(editingId, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        if (response?.data?.success) {
          await fetchCategories();
          showSuccessToast('Category updated successfully');
        }
      }
      setEditingId(null);
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Delete this category?')) return;

    setDeletingId(categoryId);
    try {
      const response = await adminApi.deleteCategory(categoryId);
      if (response?.data?.success) {
        await fetchCategories();
        showSuccessToast('Category deleted successfully');
      }
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading categories..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-green-400" />
            Category Management
          </h1>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Add/Edit Form */}
        {editingId && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId === 'new' ? 'Add New Category' : 'Edit Category'}
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                maxLength={2}
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-6 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-6 hover:shadow-2xl hover:border-green-400 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{category.icon}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(category.id);
                      setFormData({
                        name: category.name,
                        description: category.description,
                        icon: category.icon,
                      });
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 font-semibold mb-4">{category.description}</p>
              <p className="text-sm text-green-600 font-bold">
                {category.productCount} products
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <CategoriesContent />
    </AdminGuard>
  );
}
