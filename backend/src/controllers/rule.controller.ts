import { Response } from 'express';
import { AuthRequest } from '../types';
import catchAsync from '../utils/catchAsync';
import * as ruleService from '../services/rule.service';

/**
 * GET /api/rules
 */
export const getAllRules = catchAsync(async (_req: AuthRequest, res: Response) => {
  const rules = await ruleService.getAllRules();
  res.status(200).json({ status: 'success', results: rules.length, data: { rules } });
});

/**
 * GET /api/rules/:id
 */
export const getRuleById = catchAsync(async (req: AuthRequest, res: Response) => {
  const rule = await ruleService.getRuleById(req.params.id as string);
  res.status(200).json({ status: 'success', data: { rule } });
});

/**
 * POST /api/rules  (admin)
 */
export const createRule = catchAsync(async (req: AuthRequest, res: Response) => {
  const rule = await ruleService.createRule(req.body, req.user!._id);
  res.status(201).json({ status: 'success', data: { rule } });
});

/**
 * PUT /api/rules/:id  (admin)
 */
export const updateRule = catchAsync(async (req: AuthRequest, res: Response) => {
  const rule = await ruleService.updateRule(req.params.id as string, req.body, req.user!._id);
  res.status(200).json({ status: 'success', data: { rule } });
});

/**
 * DELETE /api/rules/:id  (admin – soft delete)
 */
export const deleteRule = catchAsync(async (req: AuthRequest, res: Response) => {
  await ruleService.deleteRule(req.params.id as string, req.user!._id);
  res.status(204).json({ status: 'success', data: null });
});
