import { Types } from 'mongoose';
import Meal, { IMeal } from '../models/meal.model';
import MealPlan from '../models/mealPlan.model';
import AppError from '../utils/AppError';
import { syncTotalCalories, syncPlanStatus } from './mealPlan.service';

export interface MealInput {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description?: string;
  calories: number;
  time?: string;
  timing?: 'pre_workout' | 'post_workout' | 'none';
  ingredients?: string[];
}

/** Verify the meal plan belongs to the user (or user is admin). */
const assertPlanOwnership = async (
  planId: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<Types.ObjectId> => {
  if (!Types.ObjectId.isValid(planId)) throw new AppError('Invalid meal plan ID', 400);

  const filter: Record<string, unknown> = { _id: planId, deletedAt: null };
  if (!isAdmin) filter.userId = userId;

  const plan = await MealPlan.findOne(filter).select('_id');
  if (!plan) throw new AppError('Meal plan not found or access denied', 404);
  return plan._id as Types.ObjectId;
};

/** Get all meals for a plan. */
export const getMealsForPlan = async (
  planId: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<IMeal[]> => {
  await assertPlanOwnership(planId, userId, isAdmin);
  return Meal.find({ mealPlanId: planId, deletedAt: null }).sort({ time: 1 });
};

/** Add a meal to an existing plan. */
export const createMeal = async (
  planId: string,
  userId: Types.ObjectId,
  isAdmin: boolean,
  input: MealInput
): Promise<IMeal> => {
  const planObjectId = await assertPlanOwnership(planId, userId, isAdmin);

  const meal = await Meal.create({ ...input, mealPlanId: planObjectId });

  // Keep totalCalories in sync
  await syncTotalCalories(planObjectId);

  return meal;
};

/** Update an existing meal. */
export const updateMeal = async (
  id: string,
  userId: Types.ObjectId,
  isAdmin: boolean,
  input: Partial<MealInput>
): Promise<IMeal> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid meal ID', 400);

  const meal = await Meal.findOne({ _id: id, deletedAt: null }).populate('mealPlanId');
  if (!meal) throw new AppError('No meal found with that ID', 404);

  const plan = await MealPlan.findOne({
    _id: meal.mealPlanId,
    ...(isAdmin ? {} : { userId }),
    deletedAt: null,
  });
  if (!plan) throw new AppError('Access denied', 403);

  const updated = await Meal.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!updated) throw new AppError('No meal found with that ID', 404);

  await syncTotalCalories(plan._id as Types.ObjectId);
  return updated;
};

/** Toggle the completed flag on a meal. */
export const toggleMealCompleted = async (
  id: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<IMeal> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid meal ID', 400);

  const meal = await Meal.findOne({ _id: id, deletedAt: null });
  if (!meal) throw new AppError('No meal found with that ID', 404);

  const plan = await MealPlan.findOne({
    _id: meal.mealPlanId,
    ...(isAdmin ? {} : { userId }),
    deletedAt: null,
  });
  if (!plan) throw new AppError('Access denied', 403);

  meal.completed = !meal.completed;
  await meal.save();

  // Keep the plan's status in sync: all meals eaten -> 'completed',
  // otherwise back to 'active' (unless the plan was explicitly 'skipped').
  await syncPlanStatus(plan._id as Types.ObjectId);

  return meal;
};

/** Soft-delete a meal and update the plan's totalCalories. */
export const deleteMeal = async (
  id: string,
  userId: Types.ObjectId,
  isAdmin: boolean
): Promise<void> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid meal ID', 400);

  const meal = await Meal.findOne({ _id: id, deletedAt: null });
  if (!meal) throw new AppError('No meal found with that ID', 404);

  const plan = await MealPlan.findOne({
    _id: meal.mealPlanId,
    ...(isAdmin ? {} : { userId }),
    deletedAt: null,
  });
  if (!plan) throw new AppError('Access denied', 403);

  await Meal.findByIdAndUpdate(id, { deletedAt: new Date() });
  await syncTotalCalories(plan._id as Types.ObjectId);
};
