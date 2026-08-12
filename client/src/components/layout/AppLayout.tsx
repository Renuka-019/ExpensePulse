import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Personal Dashboard',
  '/expenses': 'Expense Management',
  '/income': 'Income Tracker',
  '/transactions': 'Transaction History',
  '/budgets': 'Budget Planner & Limits',
  '/reports': 'Profit & Loss Analytics',
  '/profile': 'Profile & Settings',
  '/admin': 'Admin System Dashboard'
};

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || (location.pathname.startsWith('/admin/users/') ? 'User Analytics Detail' : 'ExpensePulse');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
