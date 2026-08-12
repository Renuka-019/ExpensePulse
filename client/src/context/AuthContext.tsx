import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  currency: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  signup: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  formatCurrency: (amount: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginAsDemo = async () => {
    await login('demo@expensetracker.com', 'User123!');
  };

  const loginAsAdmin = async () => {
    await login('admin@expensetracker.com', 'Admin123!');
  };

  const signup = async (name: string, email: string, password: string, currency: string = 'USD') => {
    const res = await api.post('/auth/signup', { name, email, password, currency });
    const { accessToken, user: userData } = res.data;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const formatCurrency = (amount: number): string => {
    const curr = user?.currency || 'USD';
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥'
    };
    const symbol = symbols[curr] || '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        loginAsDemo,
        loginAsAdmin,
        signup,
        logout,
        updateUser,
        formatCurrency
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
