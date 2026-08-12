import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getPnLReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { year = new Date().getFullYear().toString() } = req.query;
    const targetYear = parseInt(year as string, 10);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(targetYear, 0, 1),
          lte: new Date(targetYear, 11, 31, 23, 59, 59)
        }
      },
      orderBy: { date: 'asc' }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReport = monthNames.map((name, index) => ({
      month: name,
      income: 0,
      expenses: 0,
      netProfit: 0
    }));

    let yearlyIncome = 0;
    let yearlyExpenses = 0;
    const categoryTotals: Record<string, number> = {};
    const paymentMethodTotals: Record<string, number> = {};

    transactions.forEach((t) => {
      const monthIdx = new Date(t.date).getMonth();
      if (t.type === 'income') {
        monthlyReport[monthIdx].income += t.amount;
        yearlyIncome += t.amount;
      } else {
        monthlyReport[monthIdx].expenses += t.amount;
        yearlyExpenses += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        paymentMethodTotals[t.paymentMethod] = (paymentMethodTotals[t.paymentMethod] || 0) + t.amount;
      }
    });

    monthlyReport.forEach((m) => {
      m.netProfit = m.income - m.expenses;
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const paymentMethods = Object.entries(paymentMethodTotals)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);

    return res.json({
      year: targetYear,
      yearlyIncome,
      yearlyExpenses,
      yearlyNetProfit: yearlyIncome - yearlyExpenses,
      yearlySavingsRate: yearlyIncome > 0 ? ((yearlyIncome - yearlyExpenses) / yearlyIncome) * 100 : 0,
      monthlyBreakdown: monthlyReport,
      topCategories,
      paymentMethods
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
