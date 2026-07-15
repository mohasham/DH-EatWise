import { Types } from 'mongoose';
import User, { IUser } from '../models/user.model';
import AppError from '../utils/AppError';

export interface UserUpdateInput {
  name?: string;
  role?: 'user' | 'admin';
  profileComplete?: boolean;
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
