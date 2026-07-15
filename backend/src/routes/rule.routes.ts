import { Router } from 'express';
import {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
} from '../controllers/rule.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  createRuleValidator,
  updateRuleValidator,
  ruleIdParam,
} from '../validators/rule.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All rules routes require authentication
router.use(protect);

// Read access for all authenticated users
router.get('/', getAllRules);
router.get('/:id', ruleIdParam, validate, getRuleById);

// Write access for admins only
router.post('/', restrictTo('admin'), createRuleValidator, validate, createRule);
router.put('/:id', restrictTo('admin'), updateRuleValidator, validate, updateRule);
router.delete('/:id', restrictTo('admin'), ruleIdParam, validate, deleteRule);

export default router;
