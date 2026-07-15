import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { updateUserValidator, mongoIdParam } from '../validators/user.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// All user management routes are admin-only
router.use(protect, restrictTo('admin'));

router.get('/', getAllUsers);
router.get('/:id', mongoIdParam, validate, getUserById);
router.put('/:id', updateUserValidator, validate, updateUser);
router.delete('/:id', mongoIdParam, validate, deleteUser);

export default router;
