import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(80),
  image: z.string().url().optional().or(z.literal('')),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const courseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  thumbnail: z.string().url().optional().or(z.literal('')),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  isPublished: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export const courseRequestCreateSchema = z.object({
  email: z.string().email(),
  categoryId: z
    .string()
    .optional()
    .transform((s) => {
      const t = s?.trim();
      return t && t.length > 0 ? t : undefined;
    }),
  note: z.string().max(2000).optional(),
});

export const adminUserCreateSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'admin']),
});

export const adminUserUpdateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  q: z.string().max(200).optional(),
  categoryId: z.string().optional(),
});
