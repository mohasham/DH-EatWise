import mongoose, { Document, Schema, Types, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  profileComplete: boolean;
  lastModifiedBy: Types.ObjectId | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
    },
    profileComplete: {
      type: Boolean,
      default: false,
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
userSchema.index({ email: 1 });
userSchema.index({ deletedAt: 1 });

// --- Pre-save: hash password (Using standard async/await resolution) ---
userSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// --- Instance method: compare password ---
userSchema.methods.comparePassword = async function (
  this: any,
  candidatePassword: string
): Promise<boolean> {
  // Since password has select: false, fallback to checking this._doc if needed
  const currentPassword = this.password || this._doc?.password;
  if (!currentPassword) return false;
  return bcrypt.compare(candidatePassword, currentPassword);
};

// --- Hide sensitive fields in JSON output ---
userSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;