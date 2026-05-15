import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';
import type { JwtPayload, UserRole } from '../types.js';

export function signAccessToken(userId: string, role: UserRole): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
  };
  return jwt.sign({ sub: userId, role } satisfies JwtPayload, config.jwtSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, config.jwtSecret);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token');
  }
  const sub = 'sub' in decoded ? (decoded as { sub?: string }).sub : undefined;
  const role = 'role' in decoded ? (decoded as { role?: UserRole }).role : undefined;
  if (!sub || (role !== 'user' && role !== 'admin')) {
    throw new Error('Invalid token payload');
  }
  return { sub, role };
}
