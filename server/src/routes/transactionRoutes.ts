import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
