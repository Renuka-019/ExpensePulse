import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Receipt,
  DollarSign,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AdminPage: React.FC = () => {
  const { formatCurrency } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users', { params: { page, limit: 10, search } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setTotalPages(usersRes.data.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAdminData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-900/40 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Governance & System Analytics</h1>
            <p className="text-xs text-amber-200/70">Aggregate platform statistics and user monitoring.</p>
          </div>
        </div>
      </div>

      {/* Platform Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered Users</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Transactions Logged</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalTransactions || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Platform Inflow</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats?.totalVolumeIncome || 0)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Platform Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(stats?.totalVolumeExpenses || 0)}
          </p>
        </div>
      </div>

      {/* Popular Categories Across All Users */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <span>Most Frequent Expense Categories Platform-Wide</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats?.popularCategories?.map((item: any, idx: number) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.category}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.count} logged entries</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Users Searchable Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Users Directory</h2>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </form>
        </div>

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 font-semibold">User</th>
                <th className="py-3.5 px-6 font-semibold">Role</th>
                <th className="py-3.5 px-6 font-semibold">Joined Date</th>
                <th className="py-3.5 px-6 font-semibold">Transactions</th>
                <th className="py-3.5 px-6 font-semibold text-right">Net Cashflow</th>
                <th className="py-3.5 px-6 font-semibold text-center">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-semibold">{u.transactionCount}</td>
                    <td
                      className={`py-4 px-6 font-bold text-right ${
                        u.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(u.netProfit)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No registered users found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
