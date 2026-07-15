import { body, param } from 'express-validator';

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be user or admin'),

  body('profileComplete')
    .optional()
    .isBoolean().withMessage('profileComplete must be a boolean'),

  // Prevent password changes through this route
  body('password').not().exists().withMessage('Use /api/auth/change-password to update password'),
];

export const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];
