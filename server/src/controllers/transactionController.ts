import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  note: z.string().optional().nullable(),
  paymentMethod: z.string().optional().default('Cash'),
  isRecurring: z.boolean().optional().default(false),
  recurrenceInterval: z.string().optional().nullable()
});

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      page = '1',
      limit = '10',
      type,
      category,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };

    if (type && (type === 'income' || type === 'expense')) {
      whereClause.type = type;
    }

    if (category) {
      whereClause.category = category as string;
    }

    if (search) {
      whereClause.OR = [
        { category: { contains: search as string } },
        { note: { contains: search as string } },
        { paymentMethod: { contains: search as string } }
      ];
    }

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate as string);
      }
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    return res.json({
      transactions,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parsed = transactionSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: parsed.type,
        amount: parsed.amount,
        category: parsed.category,
        date: parsed.date,
        note: parsed.note || null,
        paymentMethod: parsed.paymentMethod || 'Cash',
        isRecurring: parsed.isRecurring || false,
        recurrenceInterval: parsed.isRecurring ? parsed.recurrenceInterval : null
      }
    });

    return res.status(201).json(transaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const parsed = transactionSchema.partial().parse(req.body);

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(parsed.type && { type: parsed.type }),
        ...(parsed.amount && { amount: parsed.amount }),
        ...(parsed.category && { category: parsed.category }),
        ...(parsed.date && { date: parsed.date }),
        ...(parsed.note !== undefined && { note: parsed.note }),
        ...(parsed.paymentMethod && { paymentMethod: parsed.paymentMethod }),
        ...(parsed.isRecurring !== undefined && { isRecurring: parsed.isRecurring }),
        ...(parsed.recurrenceInterval !== undefined && { recurrenceInterval: parsed.recurrenceInterval })
      }
    });

    return res.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id } });

    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};

    allTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const netProfit = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    const expenseByCategory = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));

    const recentTransactions = allTransactions.slice(0, 5);

    // Calculate last 6 months trend data
    const monthsData: { [key: string]: { month: string; income: number; expenses: number } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthsData[key] = { month: label, income: 0, expenses: 0 };
    }

    allTransactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthsData[key]) {
        if (t.type === 'income') {
          monthsData[key].income += t.amount;
        } else {
          monthsData[key].expenses += t.amount;
        }
      }
    });

    const monthlyTrends = Object.values(monthsData);

    return res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      savingsRate,
      expenseByCategory,
      recentTransactions,
      monthlyTrends
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error calculating dashboard summary', error: error.message });
  }
};
