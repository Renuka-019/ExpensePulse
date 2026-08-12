import React, { useState, useEffect } from 'react';
import { X, Target, DollarSign } from 'lucide-react';
import api from '../../services/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Array<{ name: string; type: string }>;
  month: number;
  year: number;
  initialCategory?: string;
  initialLimit?: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  month,
  year,
  initialCategory = '',
  initialLimit = 0
}) => {
  const [category, setCategory] = useState<string>(initialCategory);
  const [monthlyLimit, setMonthlyLimit] = useState<string>(initialLimit ? initialLimit.toString() : '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setMonthlyLimit(initialLimit ? initialLimit.toString() : '');
      setError('');
    }
  }, [isOpen, initialCategory, initialLimit]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) {
      setError('Please enter a valid monthly limit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/budgets', {
        category,
        monthlyLimit: parseFloat(monthlyLimit),
        month,
        year
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Set Monthly Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {expenseCategories.map((c, idx) => (
                <option key={idx} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Spending Limit</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="1"
                placeholder="500"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Set Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
