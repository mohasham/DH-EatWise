import type { Request, Response } from 'express';
import app from '../backend/src/app';
import connectDB from '../backend/src/config/db';

// Cache the DB connection promise so warm invocations reuse the connection.
let connPromise: Promise<void> | null = null;

async function ensureDb(): Promise<void> {
  if (!connPromise) {
    connPromise = connectDB().catch((err: unknown) => {
      connPromise = null;
      throw err;
    });
  }
  return connPromise;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await ensureDb();
  } catch (err) {
    console.error('[Serverless] Database connection failed:', err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
    return;
  }
  return app(req, res);
}
