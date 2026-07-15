import { Router } from 'express';
import {
  getMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMeals,
  createMeal,
  generatePlan,
} from '../controllers/mealPlan.controller';
import { protect } from '../middlewares/auth.middleware';
import {
  createMealPlanValidator,
  updateMealPlanValidator,
  mealPlanIdParam,
  mealPlanQueryValidator,
  createMealValidator,
} from '../validators/mealPlan.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(protect);

// /api/meal-plans
router.get('/', mealPlanQueryValidator, validate, getMealPlans);
router.post('/', createMealPlanValidator, validate, createMealPlan);
router.get('/:id', mealPlanIdParam, validate, getMealPlanById);
router.put('/:id', updateMealPlanValidator, validate, updateMealPlan);
router.delete('/:id', mealPlanIdParam, validate, deleteMealPlan);

// /api/meal-plans/:id/generate — AI generate meals
router.post('/:id/generate', mealPlanIdParam, validate, generatePlan);

// /api/meal-plans/:planId/meals
router.get('/:planId/meals', validate, getMeals);
router.post('/:planId/meals', createMealValidator, validate, createMeal);

export default router;
