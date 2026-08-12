import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Tag,
  Trash2,
  Edit2,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TransactionModal } from '../components/modals/TransactionModal';

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  savingsRate: number;
  expenseByCategory: Array<{ category: string; amount: number }>;
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod: string;
    isRecurring: boolean;
  }>;
  monthlyTrends: Array<{ month: string; income: number; expenses: number }>;
}

const CATEGORY_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#ef4444', '#14b8a6', '#06b6d4'
];

export const DashboardPage: React.FC = () => {
  const { user, formatCurrency } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [editingTx, setEditingTx] = useState<any | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/transactions/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Error loading dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleEdit = (tx: any) => {
    setEditingTx(tx);
    setModalType(tx.type);
    setModalOpen(true);
  };

  const openAddModal = (type: 'income' | 'expense') => {
    setEditingTx(null);
    setModalType(type);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const netProfit = summary?.netProfit || 0;
  const isProfitPositive = netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good day, {user?.name} 👋</h1>
          <p className="text-xs text-slate-300 mt-1">Here is your financial pulse and profit & loss summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal('income')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary?.totalIncome || 0)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Recorded Inflow</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary?.totalExpenses || 0)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Total Outflow</span>
          </div>
        </div>

        {/* Net Profit/Loss Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Profit / Loss</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isProfitPositive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${
              isProfitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isProfitPositive ? 'Positive Cash Surplus' : 'Deficit Spending'}
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Savings Rate</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {(summary?.savingsRate || 0).toFixed(1)}%
          </p>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Target &gt; 20%
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Income vs Expenses Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Income vs Expenses (6 Months)</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {summary?.monthlyTrends && summary.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available yet
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Donut Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Expenses by Category</h2>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            {summary?.expenseByCategory && summary.expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {summary.expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No expense categories yet</p>
            )}
          </div>

          {/* Mini Legend List */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {summary?.expenseByCategory.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[110px]">
                    {item.category}
                  </span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <span className="text-xs text-slate-400">Showing last 5 entries</span>
        </div>

        {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.category}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                      {tx.note && <span className="truncate max-w-[160px]">• {tx.note}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(tx)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">No transactions recorded yet.</p>
            <button
              onClick={() => openAddModal('expense')}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
            >
              Add First Transaction
            </button>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchSummary}
        initialType={modalType}
        editingTransaction={editingTx}
      />
    </div>
  );
};
