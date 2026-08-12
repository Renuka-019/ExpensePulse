# ExpensePulse — Full-Stack User-Driven Expense Tracker Application

A full-stack, user-driven Expense Tracker web application with a modern, minimal UI. Built with React (Vite + TypeScript), Tailwind CSS, Framer Motion, Recharts, Express (Node.js + TypeScript), Prisma, and SQLite.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

---

### 1. Backend Setup (`/server`)

```bash
cd server
npm install

# Initialize SQLite database schema
npx prisma db push

# Seed sample data (Demo User & Admin accounts with 6-month transaction history)
npm run db:seed

# Start backend server (runs on http://localhost:5000)
npm run dev
```

---

### 2. Frontend Setup (`/client`)

Open a new terminal window:

```bash
cd client
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

You can use the **1-Click Instant Login** buttons on the Login page or log in with these credentials:

| Role | Email | Password | Access Level |
| text | text | text | text |
| **Demo User** | `demo@expensetracker.com` | `User123!` | Personal Dashboard, Income/Expense CRUD, Budgets, Reports |
| **Admin** | `admin@expensetracker.com` | `Admin123!` | All User Features + System Governance & User Drill-Down |

---

## ✨ Features Built

1. **Authentication & Security**
   - JWT Access & Refresh token architecture
   - Role-based middleware (`authenticate`, `requireAdmin`)
   - Password hashing with `bcryptjs`
   - Dark & Light mode preference persistent state

2. **Personal Dashboard**
   - Summary stat cards: Total Income, Total Expenses, Net Profit/Loss, Savings Rate
   - Interactive 6-month Income vs Expense area chart (Recharts)
   - Expense category spending donut chart
   - Recent transactions feed with quick edit & delete

3. **Core CRUD & Budget Management**
   - Separate **Expenses** and **Income** pages with modal forms
   - Support for payment methods, notes, and recurring intervals
   - Category budget limit tracking with visual progress bars and over-budget alert badges

4. **Transaction History & CSV Export**
   - Filter by date range, category, and type (income/expense)
   - Search by note or payment method
   - Download complete CSV export report with one click

5. **Profit & Loss Analytics**
   - Monthly and yearly P&L performance tables
   - Spending distribution across payment methods

6. **Admin Dashboard**
   - System-wide user directory with search/filter
   - Aggregated platform statistics
   - Read-only drill-down view into specific user transaction histories (`/admin/users/:id`)

---

## 📁 Project Architecture

```
expense-tracker/
├── server/
│   ├── prisma/
│   │   └── schema.prisma      # Database models (User, Transaction, Category, Budget)
│   ├── src/
│   │   ├── controllers/       # Auth, Transaction, Category, Budget, Report, Admin
│   │   ├── middleware/        # JWT Auth & Admin checks
│   │   ├── routes/            # Express router modules
│   │   ├── seed.ts            # Database seeder script
│   │   └── index.ts           # Express server entry point
│   └── package.json
└── client/
    ├── src/
    │   ├── components/        # Sidebar, Header, Modals, ProtectedRoute
    │   ├── context/           # AuthContext & currency formatter
    │   ├── pages/             # Dashboard, Expenses, Income, Transactions, Budgets, Reports, Profile, Admin
    │   ├── services/          # Axios API service instance
    │   ├── App.tsx            # Route registration
    │   └── main.tsx
    └── package.json
```
