import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

const DEFAULT_CATEGORIES = [
  // Expenses
  { name: 'Food & Dining', type: 'expense', colorTag: '#f59e0b' },
  { name: 'Housing & Rent', type: 'expense', colorTag: '#3b82f6' },
  { name: 'Transportation', type: 'expense', colorTag: '#10b981' },
  { name: 'Utilities', type: 'expense', colorTag: '#8b5cf6' },
  { name: 'Entertainment', type: 'expense', colorTag: '#ec4899' },
  { name: 'Shopping', type: 'expense', colorTag: '#6366f1' },
  { name: 'Healthcare', type: 'expense', colorTag: '#ef4444' },
  { name: 'Personal Care', type: 'expense', colorTag: '#14b8a6' },
  { name: 'Education', type: 'expense', colorTag: '#06b6d4' },
  { name: 'Subscriptions', type: 'expense', colorTag: '#a855f7' },
  { name: 'Miscellaneous', type: 'expense', colorTag: '#64748b' },
  // Income
  { name: 'Salary', type: 'income', colorTag: '#10b981' },
  { name: 'Freelance & Side Hustle', type: 'income', colorTag: '#059669' },
  { name: 'Investments & Dividends', type: 'income', colorTag: '#3b82f6' },
  { name: 'Business Income', type: 'income', colorTag: '#8b5cf6' },
  { name: 'Gifts & Bonus', type: 'income', colorTag: '#f59e0b' },
  { name: 'Other Income', type: 'income', colorTag: '#64748b' }
];

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userCategories = await prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }]
      },
      orderBy: { name: 'asc' }
    });

    if (userCategories.length === 0) {
      return res.json(DEFAULT_CATEGORIES);
    }

    return res.json(userCategories);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, type, colorTag } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Category name and type are required' });
    }

    const existing = await prisma.category.findFirst({
      where: {
        name,
        type,
        OR: [{ userId }, { userId: null }]
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = await prisma.category.create({
      data: {
        userId,
        name,
        type,
        colorTag: colorTag || '#6366f1'
      }
    });

    return res.status(201).json(newCategory);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
