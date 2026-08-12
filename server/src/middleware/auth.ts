import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-expense-tracker-2026';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
  }
  next();
};
