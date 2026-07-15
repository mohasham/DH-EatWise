import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Response } from 'express';

export interface JwtPayload {
  id: string;
  role: 'user' | 'admin';
}

export const signToken = (id: Types.ObjectId, role: 'user' | 'admin'): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  return jwt.sign({ id: id.toString(), role }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) ?? '7d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * Creates the token, attaches it to a secure HttpOnly cookie,
 * and also returns it in the JSON body for non-browser clients.
 */
export const createSendToken = (
  userId: Types.ObjectId,
  role: 'user' | 'admin',
  statusCode: number,
  res: Response,
  data: Record<string, unknown>
): void => {
  const token = signToken(userId, role);
  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRES_IN ?? 7);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};
