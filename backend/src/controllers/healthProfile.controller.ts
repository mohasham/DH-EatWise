import { Response } from 'express';
import { AuthRequest } from '../types';
import catchAsync from '../utils/catchAsync';
import * as healthProfileService from '../services/healthProfile.service';

/**
 * GET /api/health-profile  (authenticated user)
 */
export const getMyHealthProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const profile = await healthProfileService.getMyHealthProfile(req.user!._id);
  res.status(200).json({ status: 'success', data: { profile } });
});

/**
 * PUT /api/health-profile  (authenticated user – create or update)
 */
export const upsertHealthProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const profile = await healthProfileService.upsertHealthProfile(req.user!._id, req.body);
  res.status(200).json({ status: 'success', data: { profile } });
});
