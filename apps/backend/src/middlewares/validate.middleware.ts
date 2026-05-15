import type { ZodSchema } from 'zod';
import type { NextFunction, Request, Response } from 'express';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: true,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: true,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }
    (req as Request & { validatedQuery: T }).validatedQuery = parsed.data;
    next();
  };
}
