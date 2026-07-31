import { Router } from 'express';
import { register, login, logout, changePassword } from '../controllers/auth.controller';
import { registerValidator, loginValidator, changePasswordValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidator, validate, register);

// POST /api/auth/login
router.post('/login', loginValidator, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// PATCH /api/auth/change-password (authenticated)
router.patch('/change-password', protect, changePasswordValidator, validate, changePassword);

export default router;
