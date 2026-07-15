import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Reads the result of express-validator chains that ran before this middleware.
 * If there are errors it sends a 400 with a structured errors array.
 * If clean it calls next().
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 'fail',
      errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : undefined, message: e.msg })),
    });
    return;
  }
  next();
};
