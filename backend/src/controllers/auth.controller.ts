import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { createSendToken } from '../utils/jwt';
import { registerUser, loginUser, changeUserPassword } from '../services/auth.service';
import { AuthRequest } from '../types';

/**
 * POST /api/auth/register
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await registerUser({ name, email, password });

  createSendToken(user._id, user.role, 201, res, { user });
});

/**
 * POST /api/auth/login
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await loginUser({ email, password });

  createSendToken(user._id, user.role, 200, res, { user });
});

/**
 * POST /api/auth/logout
 * Clears the JWT cookie.
 */
export const logout = (_req: Request, res: Response): void => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000), // expires in 1 second
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

/**
 * PATCH /api/auth/change-password
 * Verifies the current password, then sets a new one.
 */
export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await changeUserPassword({ userId: req.user!._id, currentPassword, newPassword });

  res.status(200).json({ status: 'success', message: 'Password changed successfully' });
});
