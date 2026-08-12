import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year }
    });

    // Calculate actual spending for each category in this month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const monthExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const categorySpentMap: Record<string, number> = {};
    monthExpenses.forEach((t) => {
      categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + t.amount;
    });

    const budgetsWithStats = budgets.map((b) => {
      const spent = categorySpentMap[b.category] || 0;
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const isOverBudget = spent > b.monthlyLimit;
      return {
        ...b,
        spent,
        percentage: Math.min(Math.round(percentage), 999),
        isOverBudget
      };
    });

    return res.json({
      month,
      year,
      budgets: budgetsWithStats
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, monthlyLimit, month, year } = req.body;

    if (!category || monthlyLimit === undefined || !month || !year) {
      return res.status(400).json({ message: 'Category, monthlyLimit, month, and year are required' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month: parseInt(month, 10),
          year: parseInt(year, 10)
        }
      },
      update: {
        monthlyLimit: parseFloat(monthlyLimit)
      },
      create: {
        userId,
        category,
        monthlyLimit: parseFloat(monthlyLimit),
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      }
    });

    return res.status(200).json(budget);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await prisma.budget.delete({ where: { id } });
    return res.json({ message: 'Budget deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
