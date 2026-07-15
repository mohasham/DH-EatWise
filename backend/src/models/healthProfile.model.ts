import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IHealthProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  gender: 'male' | 'female';
  age: number;
  weight: number; // kg
  height: number; // cm
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain' | 'condition_management';
  conditions: string[];
  allergies: string[];
  dietaryPreference: string[];
  preferredFoods: string[];
  forbiddenFoods: string[];
  mealsPerDay: number;
  workStart: string | null;
  workEnd: string | null;
  studyStart: string | null;
  studyEnd: string | null;
  wakeTime: string;
  sleepTime: string;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  calorieTarget: number;
  ruleIds: Types.ObjectId[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM

const healthProfileSchema = new Schema<IHealthProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true,
    },
    gender: {
      type: String,
      enum: { values: ['male', 'female'], message: 'Gender must be male or female' },
    },
    age: {
      type: Number,
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120'],
    },
    weight: {
      type: Number,
      min: [1, 'Weight must be positive'],
    },
    height: {
      type: Number,
      min: [1, 'Height must be positive'],
    },
    goal: {
      type: String,
      enum: {
        values: ['weight_loss', 'maintenance', 'muscle_gain', 'condition_management'],
        message: 'Invalid goal value',
      },
    },
    conditions: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    dietaryPreference: {
      type: [String],
      default: [],
    },
    preferredFoods: {
      type: [String],
      default: [],
    },
    forbiddenFoods: {
      type: [String],
      default: [],
    },
    mealsPerDay: {
      type: Number,
      default: 3,
      min: [1, 'At least 1 meal per day'],
      max: [8, 'Maximum 8 meals per day'],
    },
    workStart: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) => v === null || timeRegex.test(v),
        message: 'workStart must be in HH:MM format',
      },
    },
    workEnd: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) => v === null || timeRegex.test(v),
        message: 'workEnd must be in HH:MM format',
      },
    },
    studyStart: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) => v === null || timeRegex.test(v),
        message: 'studyStart must be in HH:MM format',
      },
    },
    studyEnd: {
      type: String,
      default: null,
      validate: {
        validator: (v: string | null) => v === null || timeRegex.test(v),
        message: 'studyEnd must be in HH:MM format',
      },
    },
    wakeTime: {
      type: String,
      validate: {
        validator: (v: string) => timeRegex.test(v),
        message: 'wakeTime must be in HH:MM format',
      },
    },
    sleepTime: {
      type: String,
      validate: {
        validator: (v: string) => timeRegex.test(v),
        message: 'sleepTime must be in HH:MM format',
      },
    },
    activityLevel: {
      type: String,
      enum: {
        values: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
        message: 'Invalid activityLevel value',
      },
    },
    calorieTarget: {
      type: Number,
      min: [0, 'calorieTarget must be non-negative'],
    },
    ruleIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Rule',
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// --- Indexes ---
healthProfileSchema.index({ userId: 1 });
healthProfileSchema.index({ deletedAt: 1 });

healthProfileSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  },
});

const HealthProfile = mongoose.model<IHealthProfile>('HealthProfile', healthProfileSchema);
export default HealthProfile;
