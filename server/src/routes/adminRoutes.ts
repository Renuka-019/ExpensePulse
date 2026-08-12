import { Router } from 'express';
import { getAdminStats, getUsersList, getUserDetails } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsersList);
router.get('/users/:id', getUserDetails);

export default router;
