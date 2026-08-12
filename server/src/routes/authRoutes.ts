import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  deleteAccount
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;
