export type UserRole = 'user' | 'admin';

export type JwtPayload = {
  sub: string;
  role: UserRole;
};
