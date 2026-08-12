import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, DollarSign, Tag, CreditCard, FileText, Repeat } from 'lucide-react';
import api from '../../services/api';

interface Category {
  id?: string;
  name: string;
  type: string;
  colorTag?: string;
}

interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
  paymentMethod: string;
  isRecurring: boolean;
  recurrenceInterval?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'income' | 'expense';
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'expense',
  editingTransaction = null
}) => {
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<string>('monthly');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingNewCat, setIsAddingNewCat] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategory(editingTransaction.category);
        setDate(new Date(editingTransaction.date).toISOString().split('T')[0]);
        setNote(editingTransaction.note || '');
        setPaymentMethod(editingTransaction.paymentMethod || 'Cash');
        setIsRecurring(editingTransaction.isRecurring || false);
        setRecurrenceInterval(editingTransaction.recurrenceInterval || 'monthly');
      } else {
        setType(initialType);
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
        setPaymentMethod('Credit Card');
        setIsRecurring(false);
        setRecurrenceInterval('monthly');
      }
      setIsAddingNewCat(false);
      setError('');
    }
  }, [isOpen, initialType, editingTransaction]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCatName.trim(), type });
      setCategories((prev) => [...prev, res.data]);
      setCategory(res.data.name);
      setNewCatName('');
      setIsAddingNewCat(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!category) {
      setError('Please select or add a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        category,
        date,
        note,
        paymentMethod,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : null
      };

      if (editingTransaction && editingTransaction.id) {
        await api.put(`/transactions/${editingTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingTransaction ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Add Income'}
          </h2>
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

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Dropdown + Add Category */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            {!isAddingNewCat ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                  >
                    <option value="">Select Category</option>
                    {filteredCategories.map((c, i) => (
                      <option key={i} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(true)}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI / Digital">Digital Wallet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Note (Optional)</label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Description or memo..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Recurring Transaction</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Repeats automatically</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRecurring && (
                <select
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex gap-3">
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
              {loading ? 'Saving...' : editingTransaction ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
