import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PieChart,
  Target,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            ExpensePulse
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 max-w-5xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Full-Stack Personal Finance & Analytics Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Master Your Cashflow with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Precision Analytics</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          Track expenses, record income, monitor category budgets, and analyze profit & loss trends in real-time with an ultra-sleek, modern interface.
        </p>

        {/* CTA Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={handleQuickDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Try 1-Click Interactive Demo</span>
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Income & Expense CRUD</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Categorize transactions with support for notes, payment methods, and recurring schedules.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Profit & Loss Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Interactive 6-month trend lines, donut spending charts, and yearly P&L breakdowns.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Budgeting & Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Set monthly limits per category with progress indicators and automatic over-budget badges.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Admin Governance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Role-protected owner dashboard to view user metrics and drill down into transaction histories.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 ExpensePulse. Full-Stack User-Driven Expense Tracker App.</p>
      </footer>
    </div>
  );
};
