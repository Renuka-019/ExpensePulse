import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const { login, loginAsDemo, loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsAdmin();
      navigate('/admin');
    } catch (err: any) {
      setError('Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data.message);
    } catch (err) {
      setForgotMsg('Password reset link sent to your email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400">Log in to manage your income, expenses & budgets</p>
        </div>

        {/* Fast 1-Click Demo Buttons Box */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Demo Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={handleAdminLogin}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 border border-amber-800/60 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin User</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-bold text-white">Reset Password</h3>
            {forgotMsg ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-300 text-xs font-medium">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-400">Enter your account email to receive a password reset link.</p>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold"
                >
                  Send Reset Link
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setForgotModal(false);
                setForgotMsg('');
              }}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
