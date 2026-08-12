import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, ShieldAlert, TrendingUp, TrendingDown, DollarSign, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useAuth();
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUserData(res.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">User not found.</p>
        <Link to="/admin" className="text-emerald-400 font-semibold hover:underline">
          Back to Admin Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>User Audit: {userData.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
              Read-Only View
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{userData.email}</p>
        </div>
      </div>

      {/* User Metadata Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <img
          src={userData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`}
          alt={userData.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
        />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Role</span>
            <span className="font-bold text-slate-900 dark:text-white uppercase">{userData.role}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Currency</span>
            <span className="font-bold text-slate-900 dark:text-white">{userData.currency}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Signup Date</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {new Date(userData.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Last Active</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {new Date(userData.lastActive).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* User Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Recorded Income</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(userData.stats.totalIncome)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Recorded Expenses</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(userData.stats.totalExpenses)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Surplus / Deficit</span>
          <p
            className={`text-2xl font-bold ${
              userData.stats.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(userData.stats.netProfit)}
          </p>
        </div>
      </div>

      {/* User Transaction History Table (Read Only) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Transaction Log History ({userData.transactions.length} entries)
        </h2>

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 font-semibold">Type</th>
                <th className="py-3.5 px-6 font-semibold">Category</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Payment Method</th>
                <th className="py-3.5 px-6 font-semibold">Note</th>
                <th className="py-3.5 px-6 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {userData.transactions.length > 0 ? (
                userData.transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{tx.category}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 max-w-xs truncate">{tx.note || '—'}</td>
                    <td
                      className={`py-4 px-6 font-bold text-right ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions recorded for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
