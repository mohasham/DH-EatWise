import { body } from 'express-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeField = (field: string, label: string) =>
  body(field)
    .optional({ nullable: true })
    .custom((v) => v === null || TIME_REGEX.test(v))
    .withMessage(`${label} must be in HH:MM format or null`);

export const upsertHealthProfileValidator = [
  body('gender').optional().isIn(['male', 'female']).withMessage('Gender must be male or female'),

  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be 1–120'),

  body('weight').optional().isFloat({ min: 1 }).withMessage('Weight must be a positive number'),

  body('height').optional().isFloat({ min: 1 }).withMessage('Height must be a positive number'),

  body('goal')
    .optional()
    .isIn(['weight_loss', 'maintenance', 'muscle_gain', 'condition_management'])
    .withMessage('Invalid goal value'),

  body('conditions').optional().isArray().withMessage('conditions must be an array'),
  body('conditions.*').optional().isString().trim().withMessage('Each condition must be a string'),

  body('allergies').optional().isArray().withMessage('allergies must be an array'),
  body('allergies.*').optional().isString().trim().withMessage('Each allergy must be a string'),

  body('dietaryPreference').optional().isArray().withMessage('dietaryPreference must be an array'),

  body('preferredFoods').optional().isArray().withMessage('preferredFoods must be an array'),

  body('forbiddenFoods').optional().isArray().withMessage('forbiddenFoods must be an array'),

  body('mealsPerDay')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('mealsPerDay must be between 1 and 8'),

  timeField('workStart', 'workStart'),
  timeField('workEnd', 'workEnd'),
  timeField('studyStart', 'studyStart'),
  timeField('studyEnd', 'studyEnd'),

  body('wakeTime')
    .optional()
    .matches(TIME_REGEX)
    .withMessage('wakeTime must be in HH:MM format'),

  body('sleepTime')
    .optional()
    .matches(TIME_REGEX)
    .withMessage('sleepTime must be in HH:MM format'),

  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active'])
    .withMessage('Invalid activityLevel value'),

    // I added this validation rules when we use dynamic rules
    body('ruleIds').optional().isArray().withMessage('ruleIds must be an array'),
    body('ruleIds.*').optional().isMongoId().withMessage('Each ruleId must be a valid id'),
];
