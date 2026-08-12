import React, { useState } from 'react';
import { User, Lock, Moon, Sun, DollarSign, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, darkMode, toggleDarkMode, logout } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      const res = await api.put('/auth/profile', { name, currency, avatarUrl });
      updateUser(res.data.user);
      setProfileMsg('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg('');
    setPassError('');
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPassMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/auth/account');
      logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Delete account failed:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <img
          src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
            {user?.role} Account
          </span>
        </div>
      </div>

      {/* Edit Profile Info Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Profile</h2>
        </div>

        {profileMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Currency Preference</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            {profileLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Lock className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h2>
        </div>

        {passMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            {passMsg}
          </div>
        )}
        {passError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {passError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
          >
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Permanently delete your user account and purge all associated expense, income, and category data.
        </p>
        <button
          onClick={() => setDeleteModal(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete your account? This action is non-reversible.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
