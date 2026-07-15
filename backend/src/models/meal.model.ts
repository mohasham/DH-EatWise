import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMeal extends Document {
  _id: Types.ObjectId;
  mealPlanId: Types.ObjectId;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  recipe: string[];
  calories: number;
  time: string;
  timing: 'pre_workout' | 'post_workout' | 'none';
  ingredients: string[];
  imgUrl: string | null;
  completed: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>(
  {
    mealPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'MealPlan',
      required: [true, 'mealPlanId is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'snack'],
        message: 'Type must be breakfast, lunch, dinner, or snack',
      },
      required: [true, 'type is required'],
    },
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
      maxlength: [200, 'Meal name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    recipe: {
      type: [String],
      default: [],
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories must be non-negative'],
    },
    time: {
      type: String,
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: 'time must be in HH:MM format',
      },
    },
    timing: {
      type: String,
      enum: {
        values: ['pre_workout', 'post_workout', 'none'],
        message: 'timing must be pre_workout, post_workout, or none',
      },
      default: 'none',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    imgUrl: {
      type: String,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// --- Indexes ---
mealSchema.index({ mealPlanId: 1 });
mealSchema.index({ mealPlanId: 1, type: 1 });
mealSchema.index({ deletedAt: 1 });

mealSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  },
});

const Meal = mongoose.model<IMeal>('Meal', mealSchema);
export default Meal;