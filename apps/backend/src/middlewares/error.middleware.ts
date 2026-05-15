import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(', ');
    res.status(400).json({ error: true, message });
    return;
  }
  if (err instanceof Error && err.message === 'Not found') {
    res.status(404).json({ error: true, message: 'Not found' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: true, message: 'Internal server error' });
}
