import { Types } from 'mongoose';
import User, { IUser } from '../models/user.model';
import AppError from '../utils/AppError';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ChangePasswordInput {
  userId: Types.ObjectId;
  currentPassword: string;
  newPassword: string;
}

/**
 * Create a new user account.
 * Returns the created user (password excluded via model toJSON transform).
 */
export const registerUser = async (input: RegisterInput): Promise<IUser> => {
  const existing = await User.findOne({ email: input.email, deletedAt: null });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
  });

  return user;
};

/**
 * Validate credentials and return the user document.
 * The password field is explicitly selected here because it has `select: false`.
 */
export const loginUser = async (input: LoginInput): Promise<IUser> => {
  const user = await User.findOne({ email: input.email, deletedAt: null }).select('+password');

  if (!user || !(await user.comparePassword(input.password))) {
    // Use the same message for both cases to prevent email enumeration
    throw new AppError('Invalid email or password', 401);
  }

  return user;
};

/**
 * Change a user's password after verifying their current one.
 * The new password is hashed by the model's pre-save hook.
 */
export const changeUserPassword = async (input: ChangePasswordInput): Promise<void> => {
  const user = await User.findById(input.userId).select('+password');
  if (!user) throw new AppError('No user found with that ID', 404);

  if (!(await user.comparePassword(input.currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = input.newPassword;
  await user.save();
};
