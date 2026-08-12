import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomePage } from './pages/IncomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AdminUserDetailPage } from './pages/AdminUserDetailPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected Admin-Only Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
