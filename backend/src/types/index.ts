import { Request } from 'express';
import { Types } from 'mongoose';

// Authenticated request – req.user is injected by the auth middleware
export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: 'user' | 'admin';
    profileComplete: boolean;
  };
}
