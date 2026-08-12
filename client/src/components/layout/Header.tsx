import React from 'react';
import { Menu, Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenSidebar: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, title = 'Dashboard' }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {title}
            {user?.role === 'admin' && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                Admin Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search transactions..."
            className="pl-9 pr-4 py-1.5 w-64 rounded-full text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Currency preference indicator */}
        <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>{user?.currency || 'USD'}</span>
        </div>

        {/* Notifications mock */}
        <button
          title="Notifications"
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
};
