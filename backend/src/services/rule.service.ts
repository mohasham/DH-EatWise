import { Types } from 'mongoose';
import Rule, { IRule } from '../models/rule.model';
import HealthProfile from '../models/healthProfile.model';
import AppError from '../utils/AppError';

export interface RuleInput {
  description: string;
  isActive?: boolean;
}

/** Get all non-deleted rules. */
export const getAllRules = async (): Promise<IRule[]> => {
  return Rule.find({ deletedAt: null })
    .populate('addedBy', 'name email')
    .populate('lastModifiedBy', 'name email')
    .sort({ createdAt: -1 });
};

/** Get a single rule by ID. */
export const getRuleById = async (id: string): Promise<IRule> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid rule ID', 400);
  const rule = await Rule.findOne({ _id: id, deletedAt: null });
  if (!rule) throw new AppError('No rule found with that ID', 404);
  return rule;
};

/** Create a new global rule (admin only). */
export const createRule = async (
  input: RuleInput,
  adminId: Types.ObjectId
): Promise<IRule> => {
  const rule = await Rule.create({ ...input, addedBy: adminId });
  return rule;
};

/** Update an existing rule (admin only). */
export const updateRule = async (
  id: string,
  input: Partial<RuleInput>,
  adminId: Types.ObjectId
): Promise<IRule> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid rule ID', 400);

  const rule = await Rule.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { ...input, lastModifiedBy: adminId },
    { new: true, runValidators: true }
  );

  if (!rule) throw new AppError('No rule found with that ID', 404);
  return rule;
};

/**
 * Soft-delete a rule and remove its reference from all health profiles.
 */
export const deleteRule = async (
  id: string,
  adminId: Types.ObjectId
): Promise<void> => {
  if (!Types.ObjectId.isValid(id)) throw new AppError('Invalid rule ID', 400);

  const rule = await Rule.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), lastModifiedBy: adminId },
    { new: true }
  );

  if (!rule) throw new AppError('No rule found with that ID', 404);

  // Remove this ruleId from all health profiles
  await HealthProfile.updateMany(
    { ruleIds: rule._id },
    { $pull: { ruleIds: rule._id } }
  );
};
