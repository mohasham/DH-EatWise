import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRule extends Document {
  _id: Types.ObjectId;
  description: string;
  isActive: boolean;
  addedBy: Types.ObjectId;
  lastModifiedBy: Types.ObjectId | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ruleSchema = new Schema<IRule>(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'addedBy is required'],
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// --- Indexes ---
ruleSchema.index({ isActive: 1 });
ruleSchema.index({ deletedAt: 1 });

ruleSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  },
});

const Rule = mongoose.model<IRule>('Rule', ruleSchema);
export default Rule;
