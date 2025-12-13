'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { adminApi, handleApiError } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/store/uiStore';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { AdminGuard } from '@/components/shared/AuthGuard';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  orders: number;
  totalSpent: number;
}

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Mock data for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers([
        {
          id: '1',
          fullName: 'Raj Kumar',
          email: 'raj@example.com',
          phone: '+91 9876543210',
          role: 'user',
          createdAt: '2024-01-15',
          orders: 5,
          totalSpent: 12450,
        },
        {
          id: '2',
          fullName: 'Priya Singh',
          email: 'priya@example.com',
          phone: '+91 9876543211',
          role: 'user',
          createdAt: '2024-02-20',
          orders: 3,
          totalSpent: 7890,
        },
      ]);
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Delete this user?')) return;

    setDeletingId(userId);
    try {
      const response = await adminApi.deleteUser(userId);
      if (response.data.success) {
        setUsers(users.filter((u) => u.id !== userId));
        showSuccessToast('User deleted successfully');
      }
    } catch (error) {
      const message = handleApiError(error);
      showErrorToast(message, 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <PageLoader message="Loading users..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-4xl font-black text-white flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-green-400" />
          User Management
        </h1>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-green-400"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Orders</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{user.orders}</td>
                    <td className="px-6 py-4 font-bold text-green-600">₹{user.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}
