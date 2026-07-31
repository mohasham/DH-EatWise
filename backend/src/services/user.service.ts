import { Types } from 'mongoose';
import User, { IUser } from '../models/user.model';
import AppError from '../utils/AppError';

export interface UserUpdateInput {
  name?: string;
  role?: 'user' | 'admin';
  profileComplete?: boolean;
}

export interface UpdateMeInput {
  name?: string;
  email?: string;
}

/** Return all non-deleted users (admin only). */
export const getAllUsers = async (): Promise<IUser[]> => {
  return User.find({ deletedAt: null }).sort({ createdAt: -1 });
};

/** Return a single non-deleted user by id. */
export const getUserById = async (id: string): Promise<IUser> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid user ID', 400);

  const user = await User.findOne({ _id: id, deletedAt: null });
  if (!user) throw new AppError('No user found with that ID', 404);
  return user;
};

/** Admin updates a user's profile fields. */
export const updateUser = async (
  id: string,
  input: UserUpdateInput,
  adminId: Types.ObjectId
): Promise<IUser> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid user ID', 400);

  const user = await User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...input, lastModifiedBy: adminId },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError('No user found with that ID', 404);
  return user;
};

/** A user updates their own name and/or email. Email must stay unique. */
export const updateMe = async (
  userId: Types.ObjectId,
  input: UpdateMeInput
): Promise<IUser> => {
  if (!Types.ObjectId.isValid(userId)) throw new AppError('Invalid user ID', 400);

  if (input.email) {
    const email = input.email.toLowerCase();
    const existing = await User.findOne({ email, deletedAt: null, _id: { $ne: userId } });
    if (existing) throw new AppError('That email is already in use by another account', 409);
    input.email = email;
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { ...input, lastModifiedBy: userId },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError('No user found with that ID', 404);
  return user;
};

/** Soft-delete a user (admin only). */
export const deleteUser = async (
  id: string,
  adminId: Types.ObjectId
): Promise<void> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid user ID', 400);

  const user = await User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), lastModifiedBy: adminId },
    { new: true }
  );

  if (!user) throw new AppError('No user found with that ID', 404);
};

/** A user soft-deletes their own account. */
export const deleteMe = async (userId: Types.ObjectId): Promise<void> => {
  if (!Types.ObjectId.isValid(userId)) throw new AppError('Invalid user ID', 400);

  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { deletedAt: new Date(), lastModifiedBy: userId },
    { new: true }
  );

  if (!user) throw new AppError('No user found with that ID', 404);
};
