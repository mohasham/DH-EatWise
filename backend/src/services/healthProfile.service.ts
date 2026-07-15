import { Types } from 'mongoose';
import HealthProfile, { IHealthProfile } from '../models/healthProfile.model';
import User from '../models/user.model';
import Rule from '../models/rule.model';
import AppError from '../utils/AppError';

/**
 * Calculate Harris-Benedict BMR and apply an activity multiplier
 * to get the daily calorie target.
 */
const calculateCalorieTarget = (
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
): number => {
  // Harris-Benedict equation
  const bmr =
    gender === 'male'
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  return Math.round(bmr * (multipliers[activityLevel] ?? 1.2));
};

/**
 * Keep only real, active, non-deleted rule ids from what the client sent —
 * drops anything stale, deactivated, or fabricated.
 */
const sanitizeRuleIds = async (ruleIds: Types.ObjectId[] | undefined): Promise<Types.ObjectId[]> => {
  if (!ruleIds || !ruleIds.length) return [];
  const valid = await Rule.find({ _id: { $in: ruleIds }, isActive: true, deletedAt: null }).select('_id');
  return valid.map((r) => r._id as Types.ObjectId);
};

export type HealthProfileInput = Partial<Omit<IHealthProfile, '_id' | 'userId' | 'calorieTarget' | 'deletedAt' | 'createdAt' | 'updatedAt'>>;

/** Create or fully replace (upsert) a user's health profile. */
export const upsertHealthProfile = async (
  userId: Types.ObjectId,
  input: HealthProfileInput
): Promise<IHealthProfile> => {
  // Auto-compute calorie target when enough data is available
  let calorieTarget: number | undefined;
  if (input.gender && input.weight && input.height && input.age && input.activityLevel) {
    calorieTarget = calculateCalorieTarget(
      input.gender,
      input.weight,
      input.height,
      input.age,
      input.activityLevel
    );
  }

  const ruleIds = await sanitizeRuleIds(input.ruleIds as Types.ObjectId[] | undefined);

  const profile = await HealthProfile.findOneAndUpdate(
    { userId, deletedAt: null },
    { ...input, calorieTarget, ruleIds, userId },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Mark user's profile as complete once core fields are present
  if (input.gender && input.weight && input.height && input.age && input.goal) {
    await User.findByIdAndUpdate(userId, { profileComplete: true });
  }

  return profile;
};

/** Get a user's own health profile. */
export const getMyHealthProfile = async (userId: Types.ObjectId): Promise<IHealthProfile> => {
  const profile = await HealthProfile.findOne({ userId, deletedAt: null }).populate(
    'ruleIds',
    'description isActive'
  );

  if (!profile) throw new AppError('Health profile not found. Please complete your setup.', 404);
  return profile;
};


//-----------Before using dynamic rules------
// import { Types } from 'mongoose';
// import HealthProfile, { IHealthProfile } from '../models/healthProfile.model';
// import User from '../models/user.model';
// import Rule from '../models/rule.model';
// import AppError from '../utils/AppError';

// /**
//  * Calculate Harris-Benedict BMR and apply an activity multiplier
//  * to get the daily calorie target.
//  */
// const calculateCalorieTarget = (
//   gender: 'male' | 'female',
//   weight: number,
//   height: number,
//   age: number,
//   activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
// ): number => {
//   // Harris-Benedict equation
//   const bmr =
//     gender === 'male'
//       ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
//       : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;

//   const multipliers: Record<string, number> = {
//     sedentary: 1.2,
//     lightly_active: 1.375,
//     moderately_active: 1.55,
//     very_active: 1.725,
//   };

//   return Math.round(bmr * (multipliers[activityLevel] ?? 1.2));
// };

// /**
//  * Resolve which global rule IDs apply to this profile based on conditions.
//  * Only active, non-deleted rules are returned.
//  */
// const resolveRuleIds = async (conditions: string[]): Promise<Types.ObjectId[]> => {
//   if (!conditions.length) return [];
//   const rules = await Rule.find({ isActive: true, deletedAt: null }).select('_id');
//   // In a real AI system you'd match rule descriptions to conditions;
//   // for now return all active rules when the user has any conditions.
//   return rules.map((r) => r._id as Types.ObjectId);
// };

// export type HealthProfileInput = Partial<Omit<IHealthProfile, '_id' | 'userId' | 'calorieTarget' | 'ruleIds' | 'deletedAt' | 'createdAt' | 'updatedAt'>>;

// /** Create or fully replace (upsert) a user's health profile. */
// export const upsertHealthProfile = async (
//   userId: Types.ObjectId,
//   input: HealthProfileInput
// ): Promise<IHealthProfile> => {
//   // Auto-compute calorie target when enough data is available
//   let calorieTarget: number | undefined;
//   if (input.gender && input.weight && input.height && input.age && input.activityLevel) {
//     calorieTarget = calculateCalorieTarget(
//       input.gender,
//       input.weight,
//       input.height,
//       input.age,
//       input.activityLevel
//     );
//   }

//   const ruleIds = await resolveRuleIds(input.conditions ?? []);

//   const profile = await HealthProfile.findOneAndUpdate(
//     { userId, deletedAt: null },
//     { ...input, calorieTarget, ruleIds, userId },
//     { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
//   );

//   // Mark user's profile as complete once core fields are present
//   if (input.gender && input.weight && input.height && input.age && input.goal) {
//     await User.findByIdAndUpdate(userId, { profileComplete: true });
//   }

//   return profile;
// };

// /** Get a user's own health profile. */
// export const getMyHealthProfile = async (userId: Types.ObjectId): Promise<IHealthProfile> => {
//   const profile = await HealthProfile.findOne({ userId, deletedAt: null }).populate(
//     'ruleIds',
//     'description isActive'
//   );

//   if (!profile) throw new AppError('Health profile not found. Please complete your setup.', 404);
//   return profile;
// };
