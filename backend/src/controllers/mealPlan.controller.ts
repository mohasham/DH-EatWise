import { Response } from 'express';
import { AuthRequest } from '../types';
import catchAsync from '../utils/catchAsync';
import * as mealPlanService from '../services/mealPlan.service';
import * as mealService from '../services/meal.service';
import { generateMealsForPlan } from '../services/aiMealGeneration.service';

const isAdmin = (req: AuthRequest) => req.user!.role === 'admin';

// ---- Meal Plans ----

/** GET /api/meal-plans */
export const getMealPlans = catchAsync(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  const plans = await mealPlanService.getMealPlans(req.user!._id, { startDate, endDate });
  res.status(200).json({ status: 'success', results: plans.length, data: { plans } });
});

/** GET /api/meal-plans/:id */
export const getMealPlanById = catchAsync(async (req: AuthRequest, res: Response) => {
  const plan = await mealPlanService.getMealPlanById(req.params.id as string, req.user!._id, isAdmin(req));
  res.status(200).json({ status: 'success', data: { plan } });
});

/** POST /api/meal-plans */
export const createMealPlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const plan = await mealPlanService.createMealPlan(req.user!._id, req.body);
  res.status(201).json({ status: 'success', data: { plan } });
});

/** PUT /api/meal-plans/:id */
export const updateMealPlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const { status, totalCalories } = req.body;
  const plan = await mealPlanService.updateMealPlan(req.params.id as string, req.user!._id, isAdmin(req), { status, totalCalories });
  res.status(200).json({ status: 'success', data: { plan } });
});

/** DELETE /api/meal-plans/:id */
export const deleteMealPlan = catchAsync(async (req: AuthRequest, res: Response) => {
  await mealPlanService.deleteMealPlan(req.params.id as string, req.user!._id, isAdmin(req));
  res.status(204).json({ status: 'success', data: null });
});

/** POST /api/meal-plans/:id/generate — AI-generate meals for a plan */
export const generatePlan = catchAsync(async (req: AuthRequest, res: Response) => {
  await generateMealsForPlan(req.params.id as string, req.user!._id, isAdmin(req));
  const meals = await mealService.getMealsForPlan(req.params.id as string, req.user!._id, isAdmin(req));
  res.status(200).json({ status: 'success', results: meals.length, data: { meals } });
});

// ---- Meals within a plan ----

/** GET /api/meal-plans/:planId/meals */
export const getMeals = catchAsync(async (req: AuthRequest, res: Response) => {
  const meals = await mealService.getMealsForPlan(req.params.planId as string, req.user!._id, isAdmin(req));
  res.status(200).json({ status: 'success', results: meals.length, data: { meals } });
});

/** POST /api/meal-plans/:planId/meals */
export const createMeal = catchAsync(async (req: AuthRequest, res: Response) => {
  const meal = await mealService.createMeal(req.params.planId as string, req.user!._id, isAdmin(req), req.body);
  res.status(201).json({ status: 'success', data: { meal } });
});

/** PUT /api/meals/:id */
export const updateMeal = catchAsync(async (req: AuthRequest, res: Response) => {
  const meal = await mealService.updateMeal(req.params.id as string, req.user!._id, isAdmin(req), req.body);
  res.status(200).json({ status: 'success', data: { meal } });
});

/** PATCH /api/meals/:id/complete */
export const toggleMealCompleted = catchAsync(async (req: AuthRequest, res: Response) => {
  const meal = await mealService.toggleMealCompleted(req.params.id as string, req.user!._id, isAdmin(req));
  res.status(200).json({ status: 'success', data: { meal } });
});

/** DELETE /api/meals/:id */
export const deleteMeal = catchAsync(async (req: AuthRequest, res: Response) => {
  await mealService.deleteMeal(req.params.id as string, req.user!._id, isAdmin(req));
  res.status(204).json({ status: 'success', data: null });
});
