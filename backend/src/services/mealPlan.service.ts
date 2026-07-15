import { Types } from 'mongoose';
import MealPlan, { IMealPlan } from '../models/mealPlan.model';
import Meal from '../models/meal.model';
import HealthProfile from '../models/healthProfile.model';
import AppError from '../utils/AppError';

export interface MealInput {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description?: string;
  calories: number;
  time?: string;
  timing?: 'pre_workout' | 'post_workout' | 'none';
  ingredients?: string[];
  recipe?: string[];
}

export interface MealPlanInput {
  date: string;
  status?: 'active' | 'completed' | 'skipped';
}

/**
 * Return all meal plans for a user, optionally filtered by date range.
 * Admin can pass a userId; a regular user always gets only their own plans.
 */
export const getMealPlans = async (
  userId: Types.ObjectId,
  filters: { startDate?: string; endDate?: string }
): Promise<IMealPlan[]> => {
  const query: Record<string, unknown> = { userId, deletedAt: null };

  if (filters.startDate || filters.endDate) {
    const dateRange: Record<string, Date> = {};
    if (filters.startDate) dateRange.$gte = new Date(filters.startDate);
    if (filters.endDate) dateRange.$lte = new Date(filters.endDate);
    query.date = dateRange;
  }

  return MealPlan.find(query).sort({ date: -1 });
};

/** Get a single meal plan (user must own it). */
export const getMealPlanById = async (
  id: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<IMealPlan> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid meal plan ID', 400);

  const filter: Record<string, unknown> = { _id: id, deletedAt: null };
  if (!isAdmin) filter.userId = userId;

  const plan = await MealPlan.findOne(filter);
  if (!plan) throw new AppError('No meal plan found with that ID', 404);
  return plan;
};

/** Create a new meal plan for today (one per user per day). */
export const createMealPlan = async (
  userId: Types.ObjectId,
  input: MealPlanInput
): Promise<IMealPlan> => {
  const date = new Date(input.date);
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const existing = await MealPlan.findOne({
    userId,
    date: { $gte: dayStart, $lte: dayEnd },
    deletedAt: null,
  });

  if (existing) throw new AppError('A meal plan already exists for this date', 409);

  const healthProfile = await HealthProfile.findOne({ userId, deletedAt: null });
  if (!healthProfile) {
    throw new AppError('Complete your health profile before generating a meal plan', 400);
  }

  const plan = await MealPlan.create({
    userId,
    healthProfileId: healthProfile._id,
    date,
    status: input.status ?? 'active',
    totalCalories: 0,
  });

  return plan;
};

/** Update meal plan status or totalCalories. */
export const updateMealPlan = async (
  id: string,
  userId: Types.ObjectId,
  isAdmin: boolean,
  input: { status?: 'active' | 'completed' | 'skipped'; totalCalories?: number }
): Promise<IMealPlan> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid meal plan ID', 400);

  const filter: Record<string, unknown> = { _id: id, deletedAt: null };
  if (!isAdmin) filter.userId = userId;

  const plan = await MealPlan.findOneAndUpdate(filter, input, {
    new: true,
    runValidators: true,
  });

  if (!plan) throw new AppError('No meal plan found with that ID', 404);
  return plan;
};

/** Soft-delete a meal plan and all its meals. */
export const deleteMealPlan = async (
  id: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<void> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid meal plan ID', 400);

  const filter: Record<string, unknown> = { _id: id, deletedAt: null };
  if (!isAdmin) filter.userId = userId;

  const plan = await MealPlan.findOneAndUpdate(filter, { deletedAt: new Date() }, { new: true });
  if (!plan) throw new AppError('No meal plan found with that ID', 404);

  // Cascade soft-delete to all meals in this plan
  await Meal.updateMany({ mealPlanId: plan._id }, { deletedAt: new Date() });
};

// ---- Synchronize totalCalories after any meal mutation ----
export const syncTotalCalories = async (mealPlanId: Types.ObjectId): Promise<void> => {
  const result = await Meal.aggregate([
    { $match: { mealPlanId, deletedAt: null } },
    { $group: { _id: null, total: { $sum: '$calories' } } },
  ]);

  const total = result[0]?.total ?? 0;
  await MealPlan.findByIdAndUpdate(mealPlanId, { totalCalories: total });
};

// ---- Synchronize plan status after a meal's completed flag changes ----
// If every (non-deleted) meal in the plan is completed, mark the plan completed.
// If the plan was completed and a meal gets un-checked, revert it to active.
// Never touches plans a user has explicitly marked 'skipped'.
export const syncPlanStatus = async (mealPlanId: Types.ObjectId): Promise<void> => {
  const plan = await MealPlan.findById(mealPlanId);
  if (!plan || plan.status === 'skipped') return;

  const meals = await Meal.find({ mealPlanId, deletedAt: null }).select('completed');
  if (meals.length === 0) return;

  const allCompleted = meals.every((m) => m.completed);
  const nextStatus = allCompleted ? 'completed' : 'active';

  if (plan.status !== nextStatus) {
    plan.status = nextStatus;
    await plan.save();
  }
};