import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Receipt,
  PieChart,
  Target,
  User,
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  Wallet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Expenses', icon: TrendingDown, path: '/expenses' },
    { label: 'Income', icon: TrendingUp, path: '/income' },
    { label: 'Transactions', icon: Receipt, path: '/transactions' },
    { label: 'Budgets', icon: Target, path: '/budgets' },
    { label: 'P&L Reports', icon: PieChart, path: '/reports' },
    { label: 'Profile', icon: User, path: '/profile' }
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', icon: ShieldAlert, path: '/admin' });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              ExpensePulse
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Settings */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Dark mode switch */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* User profile preview */}
          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
