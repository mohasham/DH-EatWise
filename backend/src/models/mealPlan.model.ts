import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMealPlan extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  healthProfileId: Types.ObjectId;
  date: Date;
  totalCalories: number;
  status: 'active' | 'completed' | 'skipped';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const mealPlanSchema = new Schema<IMealPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    healthProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'HealthProfile',
      required: [true, 'healthProfileId is required'],
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
    },
    totalCalories: {
      type: Number,
      default: 0,
      min: [0, 'totalCalories must be non-negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'skipped'],
        message: 'Status must be active, completed, or skipped',
      },
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// --- Indexes ---
mealPlanSchema.index({ userId: 1, date: -1 });
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: false }); // one plan per user per day enforced at service layer
mealPlanSchema.index({ deletedAt: 1 });

mealPlanSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  },
});

const MealPlan = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);
export default MealPlan;
