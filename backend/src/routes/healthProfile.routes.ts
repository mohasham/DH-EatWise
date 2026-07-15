import { Router } from 'express';
import { getMyHealthProfile, upsertHealthProfile } from '../controllers/healthProfile.controller';
import { protect } from '../middlewares/auth.middleware';
import { upsertHealthProfileValidator } from '../validators/healthProfile.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All health-profile routes require authentication
router.use(protect);

router.get('/', getMyHealthProfile);
router.put('/', upsertHealthProfileValidator, validate, upsertHealthProfile);

export default router;
