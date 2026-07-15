import { body, param, query } from 'express-validator';

export const createMealPlanValidator = [
  body('date')
    .notEmpty().withMessage('date is required')
    .isISO8601().withMessage('date must be a valid ISO 8601 date'),

  body('status')
    .optional()
    .isIn(['active', 'completed', 'skipped']).withMessage('Invalid status value'),
];

export const updateMealPlanValidator = [
  param('id').isMongoId().withMessage('Invalid meal plan ID'),

  body('status')
    .optional()
    .isIn(['active', 'completed', 'skipped']).withMessage('Invalid status value'),

  body('totalCalories')
    .optional()
    .isFloat({ min: 0 }).withMessage('totalCalories must be non-negative'),
];

export const mealPlanIdParam = [
  param('id').isMongoId().withMessage('Invalid meal plan ID'),
];

export const mealPlanQueryValidator = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
];

// ---- Meal validators ----

export const createMealValidator = [
  param('planId').isMongoId().withMessage('Invalid meal plan ID'),

  body('type')
    .notEmpty().withMessage('type is required')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),

  body('name')
    .trim()
    .notEmpty().withMessage('Meal name is required')
    .isLength({ max: 200 }).withMessage('Meal name cannot exceed 200 characters'),

  body('calories')
    .notEmpty().withMessage('Calories are required')
    .isFloat({ min: 0 }).withMessage('Calories must be non-negative'),

  body('time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('time must be in HH:MM format'),

  body('timing')
    .optional()
    .isIn(['pre_workout', 'post_workout', 'none']).withMessage('Invalid timing value'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('ingredients')
    .optional()
    .isArray().withMessage('ingredients must be an array'),

  body('recipe')
    .optional()
    .isArray().withMessage('recipe must be an array'),

  body('imgUrl')
    .optional({ nullable: true })
    .isURL().withMessage('imgUrl must be a valid URL'),
];

export const updateMealValidator = [
  param('id').isMongoId().withMessage('Invalid meal ID'),

  body('type')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),

  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Meal name cannot exceed 200 characters'),

  body('calories')
    .optional()
    .isFloat({ min: 0 }).withMessage('Calories must be non-negative'),

  body('time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('time must be in HH:MM format'),

  body('timing')
    .optional()
    .isIn(['pre_workout', 'post_workout', 'none']).withMessage('Invalid timing value'),

  body('recipe')
    .optional()
    .isArray().withMessage('recipe must be an array'),
];

export const mealIdParam = [
  param('id').isMongoId().withMessage('Invalid meal ID'),
];