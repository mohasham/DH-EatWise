import { Router } from 'express';
import {
  updateMeal,
  toggleMealCompleted,
  deleteMeal,
} from '../controllers/mealPlan.controller';
import { protect } from '../middlewares/auth.middleware';
import { updateMealValidator, mealIdParam } from '../validators/mealPlan.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(protect);

// /api/meals
router.put('/:id', updateMealValidator, validate, updateMeal);
router.patch('/:id/complete', mealIdParam, validate, toggleMealCompleted);
router.delete('/:id', mealIdParam, validate, deleteMeal);

export default router;
