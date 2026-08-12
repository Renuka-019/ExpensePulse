import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, Calendar, DollarSign, CreditCard, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ReportsPage: React.FC = () => {
  const { formatCurrency } = useAuth();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/pnl', { params: { year } });
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching P&L report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [year]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const isNetProfitPositive = (report?.yearlyNetProfit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profit & Loss Analytics</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive yearly financial performance analysis.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>

      {/* Yearly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Yearly Revenue / Income</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(report?.yearlyIncome || 0)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Yearly Expenses</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(report?.yearlyExpenses || 0)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Yearly Net Profit</span>
          <p
            className={`text-2xl font-bold ${
              isNetProfitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(report?.yearlyNetProfit || 0)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Effective Savings Rate</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {(report?.yearlySavingsRate || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Monthly Bar Breakdown */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-500" />
          <span>Monthly Income vs Expense Breakdown ({year})</span>
        </h2>

        <div className="h-72 w-full">
          {report?.monthlyBreakdown && report.monthlyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.monthlyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Category Spending Breakdown & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expense Categories */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Expense Categories</h3>
          <div className="space-y-3">
            {report?.topCategories && report.topCategories.length > 0 ? (
              report.topCategories.map((c: any, idx: number) => {
                const maxAmount = report.topCategories[0].amount;
                const pct = (c.amount / maxAmount) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-900 dark:text-white">{c.category}</span>
                      <span className="text-slate-600 dark:text-slate-400">{formatCurrency(c.amount)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">No categories logged yet.</p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Spending by Payment Method</span>
          </h3>
          <div className="space-y-3">
            {report?.paymentMethods && report.paymentMethods.length > 0 ? (
              report.paymentMethods.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{m.method}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(m.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No payment methods recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
