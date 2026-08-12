import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalTransactions, transactionsGrouped] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.findMany({
        select: {
          type: true,
          amount: true,
          category: true
        }
      })
    ]);

    let totalVolumeIncome = 0;
    let totalVolumeExpenses = 0;
    const categoryFrequency: Record<string, number> = {};

    transactionsGrouped.forEach((t) => {
      if (t.type === 'income') {
        totalVolumeIncome += t.amount;
      } else {
        totalVolumeExpenses += t.amount;
        categoryFrequency[t.category] = (categoryFrequency[t.category] || 0) + 1;
      }
    });

    const popularCategories = Object.entries(categoryFrequency)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      totalUsers,
      totalTransactions,
      totalVolumeIncome,
      totalVolumeExpenses,
      popularCategories
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUsersList = async (req: AuthRequest, res: Response) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          currency: true,
          avatarUrl: true,
          createdAt: true,
          lastActive: true,
          _count: {
            select: { transactions: true }
          },
          transactions: {
            select: {
              type: true,
              amount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const usersWithStats = users.map((user) => {
      let totalIncome = 0;
      let totalExpenses = 0;
      user.transactions.forEach((t) => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpenses += t.amount;
      });

      const { transactions, ...userMeta } = user;
      return {
        ...userMeta,
        transactionCount: user._count.transactions,
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses
      };
    });

    return res.json({
      users: usersWithStats,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currency: true,
        avatarUrl: true,
        createdAt: true,
        lastActive: true,
        transactions: {
          orderBy: { date: 'desc' }
        },
        budgets: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    user.transactions.forEach((t) => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpenses += t.amount;
    });

    return res.json({
      ...user,
      stats: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        transactionCount: user.transactions.length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
