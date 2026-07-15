import { Response } from 'express';
import { AuthRequest } from '../types';
import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';

/**
 * GET /api/users  (admin)
 */
export const getAllUsers = catchAsync(async (_req: AuthRequest, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

/**
 * GET /api/users/:id  (admin)
 */
export const getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * PUT /api/users/:id  (admin)
 */
export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, role, profileComplete } = req.body;
  const user = await userService.updateUser(req.params.id as string, { name, role, profileComplete }, req.user!._id);
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * DELETE /api/users/:id  (admin – soft delete)
 */
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  await userService.deleteUser(req.params.id as string, req.user!._id);
  res.status(204).json({ status: 'success', data: null });
});
