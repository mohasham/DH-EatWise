import { body, param } from 'express-validator';

export const createRuleValidator = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 5, max: 500 }).withMessage('Description must be 5–500 characters'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

export const updateRuleValidator = [
  param('id').isMongoId().withMessage('Invalid rule ID'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Description must be 5–500 characters'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

export const ruleIdParam = [
  param('id').isMongoId().withMessage('Invalid rule ID'),
];
