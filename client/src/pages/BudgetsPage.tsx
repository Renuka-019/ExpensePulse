import React, { useState, useEffect } from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, Trash2, Edit2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BudgetModal } from '../components/modals/BudgetModal';

export const BudgetsPage: React.FC = () => {
  const { formatCurrency } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [editingLimit, setEditingLimit] = useState<number>(0);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets', { params: { month, year } });
      setBudgets(res.data.budgets);

      const catRes = await api.get('/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Remove this category budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Budget Planner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set spending limits and receive over-budget alerts.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month / Year Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <button
            onClick={() => {
              setEditingCategory('');
              setEditingLimit(0);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Set Limit</span>
          </button>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading budgets...</div>
        ) : budgets.length > 0 ? (
          budgets.map((b) => {
            const isOver = b.isOverBudget;
            const pct = Math.min(b.percentage, 100);

            return (
              <div
                key={b.id}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border ${
                  isOver ? 'border-rose-300 dark:border-rose-800/80 shadow-rose-500/5' : 'border-slate-200 dark:border-slate-800'
                } shadow-sm space-y-4 relative overflow-hidden`}
              >
                {/* Over Budget Badge Banner */}
                {isOver && (
                  <div className="px-3 py-1 bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Over Budget Alert</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.category}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(b.category);
                        setEditingLimit(b.monthlyLimit);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Spent vs Limit Stats */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Limit: {formatCurrency(b.monthlyLimit)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-500'
                          : pct > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>{b.percentage}% used</span>
                    <span>
                      {isOver
                        ? `Over by ${formatCurrency(b.spent - b.monthlyLimit)}`
                        : `${formatCurrency(b.monthlyLimit - b.spent)} remaining`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <Target className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No monthly budgets set for {monthNames[month - 1]} {year}.</p>
            <button
              onClick={() => {
                setEditingCategory('');
                setEditingLimit(0);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
            >
              Set First Budget
            </button>
          </div>
        )}
      </div>

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchBudgets}
        categories={categories}
        month={month}
        year={year}
        initialCategory={editingCategory}
        initialLimit={editingLimit}
      />
    </div>
  );
};
