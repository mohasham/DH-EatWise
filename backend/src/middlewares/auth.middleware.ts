import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../types';

/**
 * Protects routes that require authentication.
 * Accepts token from Authorization header (Bearer) or the `jwt` cookie.
 */
export const protect = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt as string;
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.deletedAt !== null) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Attach minimal user info to req
    req.user = {
      _id: user._id,
      role: user.role,
      profileComplete: user.profileComplete,
    };

    next();
  }
);

/**
 * Restricts access to specified roles.
 * Must be used AFTER protect.
 */
export const restrictTo =
  (...roles: Array<'user' | 'admin'>) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
