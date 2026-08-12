import React, { useState, useEffect } from 'react';
import { TrendingDown, Plus, Search, Filter, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TransactionModal } from '../components/modals/TransactionModal';

export const ExpensesPage: React.FC = () => {
  const { formatCurrency } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<any | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: {
          type: 'expense',
          page,
          limit: 10,
          search,
          category
        }
      });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pagination.totalPages);

      // Fetch category dropdown list
      const catRes = await api.get('/categories');
      setCategories(catRes.data.filter((c: any) => c.type === 'expense'));
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const totalExpenseSum = transactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Expense Tracker</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">View and manage all your outgoing expenses.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingTx(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search note or payment method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </form>

        <div className="relative w-full sm:w-48">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((c, i) => (
              <option key={i} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 font-semibold">Category</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Payment Method</th>
                <th className="py-3.5 px-6 font-semibold">Note</th>
                <th className="py-3.5 px-6 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-6 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{tx.category}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 max-w-xs truncate">{tx.note || '—'}</td>
                    <td className="py-4 px-6 font-bold text-rose-600 dark:text-rose-400 text-right">
                      -{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchExpenses}
        initialType="expense"
        editingTransaction={editingTx}
      />
    </div>
  );
};
