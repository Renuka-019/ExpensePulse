import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-expense-tracker-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-expense-tracker-2026';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  currency: z.string().optional().default('USD'),
  avatarUrl: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });
  const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
  return { accessToken, refreshToken };
};

export const signup = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: parsed.email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        passwordHash,
        currency: parsed.currency || 'USD',
        avatarUrl: parsed.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parsed.name)}`,
        role: 'user'
      }
    });

    const tokens = generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: 'Signup successful',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    const tokens = generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      ...tokens
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string; email: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const tokens = generateTokens(user);
    return res.json(tokens);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, currency, avatarUrl } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(currency && { currency }),
        ...(avatarUrl !== undefined && { avatarUrl })
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = updated;
    return res.json({ message: 'Profile updated', user: userWithoutPassword });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newHash }
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  return res.json({ message: 'Password reset link sent to your email (mock mode)' });
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.id }
    });
    return res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
