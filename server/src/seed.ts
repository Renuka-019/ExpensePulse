import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Passwords are hashed before being stored
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('User123!', 10);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Renuka Patil',
      email: 'admin@expensetracker.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      currency: 'USD',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    }
  });

  // 2. Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'demo@expensetracker.com',
      passwordHash: userPasswordHash,
      role: 'user',
      currency: 'USD',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
    }
  });

  console.log(
    `✅ Created Admin (${admin.email}) and Demo User (${demoUser.email})`
  );

  // 3. Create Default Categories
  const defaultCategories = [
    { name: 'Food & Dining', type: 'expense', colorTag: '#f59e0b' },
    { name: 'Housing & Rent', type: 'expense', colorTag: '#3b82f6' },
    { name: 'Transportation', type: 'expense', colorTag: '#10b981' },
    { name: 'Utilities', type: 'expense', colorTag: '#8b5cf6' },
    { name: 'Entertainment', type: 'expense', colorTag: '#ec4899' },
    { name: 'Shopping', type: 'expense', colorTag: '#6366f1' },
    { name: 'Healthcare', type: 'expense', colorTag: '#ef4444' },
    { name: 'Subscriptions', type: 'expense', colorTag: '#a855f7' },
    { name: 'Salary', type: 'income', colorTag: '#10b981' },
    {
      name: 'Freelance & Side Hustle',
      type: 'income',
      colorTag: '#059669'
    },
    {
      name: 'Investments & Dividends',
      type: 'income',
      colorTag: '#3b82f6'
    }
  ];

  for (const cat of defaultCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        colorTag: cat.colorTag
      }
    });
  }

  console.log('✅ Created default categories');

  // 4. Create Transactions for Demo User across last 6 months
  const now = new Date();

  const sampleTransactions = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      15
    );

    const mStr = monthDate.toLocaleString('default', {
      month: 'long'
    });

    // Monthly Salary
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'income',
      amount: 5200,
      category: 'Salary',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      ),
      note: `Monthly paycheck for ${mStr}`,
      paymentMethod: 'Bank Transfer'
    });

    // Freelance Work
    if (i % 2 === 0) {
      sampleTransactions.push({
        userId: demoUser.id,
        type: 'income',
        amount: 850,
        category: 'Freelance & Side Hustle',
        date: new Date(
          now.getFullYear(),
          now.getMonth() - i,
          12
        ),
        note: 'Web design freelance project',
        paymentMethod: 'Bank Transfer'
      });
    }

    // Housing / Rent
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'expense',
      amount: 1650,
      category: 'Housing & Rent',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        2
      ),
      note: 'Apartment rent payment',
      paymentMethod: 'Bank Transfer'
    });

    // Food & Dining
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'expense',
      amount: 480 + i * 30,
      category: 'Food & Dining',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        8
      ),
      note: 'Groceries & dining out',
      paymentMethod: 'Credit Card'
    });

    // Transportation
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'expense',
      amount: 210,
      category: 'Transportation',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        14
      ),
      note: 'Gasoline and subway pass',
      paymentMethod: 'Credit Card'
    });

    // Utilities
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'expense',
      amount: 175,
      category: 'Utilities',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        18
      ),
      note: 'Electricity, water, high-speed fiber internet',
      paymentMethod: 'Bank Transfer'
    });

    // Subscriptions
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'expense',
      amount: 65,
      category: 'Subscriptions',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        20
      ),
      note: 'Netflix, Spotify, GitHub Pro',
      paymentMethod: 'Credit Card',
      isRecurring: true,
      recurrenceInterval: 'monthly'
    });

    // Shopping / Entertainment
    sampleTransactions.push({
      userId: demoUser.id,
      type: 'expense',
      amount: 320 + i * 25,
      category: 'Shopping',
      date: new Date(
        now.getFullYear(),
        now.getMonth() - i,
        24
      ),
      note: 'Clothing and home items',
      paymentMethod: 'Credit Card'
    });
  }

  for (const transaction of sampleTransactions) {
    await prisma.transaction.create({
      data: transaction
    });
  }

  console.log(
    `✅ Created ${sampleTransactions.length} historical transactions`
  );

  // 5. Create Monthly Budgets for Demo User
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgets = [
    { category: 'Food & Dining', monthlyLimit: 500 },
    { category: 'Housing & Rent', monthlyLimit: 1700 },
    { category: 'Transportation', monthlyLimit: 250 },
    { category: 'Utilities', monthlyLimit: 200 },
    { category: 'Shopping', monthlyLimit: 300 },
    { category: 'Subscriptions', monthlyLimit: 80 }
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: {
        userId: demoUser.id,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        month: currentMonth,
        year: currentYear
      }
    });
  }

  console.log('✅ Created monthly budgets for Demo User');

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
