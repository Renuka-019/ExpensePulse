import { Router } from 'express';
import { getPnLReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/pnl', getPnLReport);

export default router;
