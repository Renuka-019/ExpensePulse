import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Calendar, ArrowUpDown, Trash2, Edit2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TransactionModal } from '../components/modals/TransactionModal';

export const TransactionsPage: React.FC = () => {
  const { formatCurrency } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<any | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: {
          page,
          limit: 10,
          type: type || undefined,
          category: category || undefined,
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder
        }
      });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.total);

      const catRes = await api.get('/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, type, category, startDate, endDate, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete transaction record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Type', 'Category', 'Amount', 'Date', 'Payment Method', 'Note', 'Recurring'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      `"${t.category}"`,
      t.amount,
      new Date(t.date).toISOString().split('T')[0],
      `"${t.paymentMethod}"`,
      `"${t.note || ''}"`,
      t.isRecurring ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {totalCount} transactions logged across income and expenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingTx(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c, idx) => (
                <option key={idx} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Date Range:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
          {(startDate || endDate || search || type || category) && (
            <button
              onClick={() => {
                setSearch('');
                setType('');
                setCategory('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-xs text-rose-500 font-medium hover:underline ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-6 font-semibold">Type</th>
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
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
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
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching transaction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing page {page} of {totalPages || 1}
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
        onSuccess={fetchTransactions}
        editingTransaction={editingTx}
      />
    </div>
  );
};
