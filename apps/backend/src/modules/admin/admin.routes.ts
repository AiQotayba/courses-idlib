import { Router } from 'express';
import { z } from 'zod';
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  courseCreateSchema,
  courseUpdateSchema,
  paginationQuerySchema,
} from '@repo/validation';
import { UserModel } from '../../models/user.model.js';
import { CategoryModel } from '../../models/category.model.js';
import { CourseModel } from '../../models/course.model.js';
import { CourseRequestModel } from '../../models/course-request.model.js';
import { notifyRequestsMatchingCourse } from '../../services/course-request-matcher.js';
import { hashPassword } from '../../utils/password.js';
import type { AuthedRequest } from '../../middlewares/auth.middleware.js';
import { requireAdmin, requireAuth } from '../../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware.js';

const adminListQuery = paginationQuerySchema;

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/users', validateQuery(adminListQuery), async (req, res, next) => {
  try {
    const q = (req as typeof req & { validatedQuery: z.infer<typeof adminListQuery> })
      .validatedQuery;
    const filter: Record<string, unknown> = {};
    if (q.q) {
      filter.$or = [
        { fullName: new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        { email: new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      ];
    }
    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(q.limit).lean(),
      UserModel.countDocuments(filter),
    ]);
    res.json({
      items: items.map(publicUser),
      page: q.page,
      limit: q.limit,
      total,
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/users', validateBody(adminUserCreateSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof adminUserCreateSchema>;
    const exists = await UserModel.exists({ email: body.email });
    if (exists) {
      res.status(409).json({ error: true, message: 'Email already registered' });
      return;
    }
    const hashed = await hashPassword(body.password);
    const user = await UserModel.create({
      fullName: body.fullName,
      email: body.email,
      password: hashed,
      role: body.role,
    });
    res.status(201).json(publicUser(user.toObject()));
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/users/:id', async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id).lean();
    if (!user) {
      res.status(404).json({ error: true, message: 'User not found' });
      return;
    }
    res.json(publicUser(user));
  } catch (e) {
    next(e);
  }
});

adminRouter.put(
  '/users/:id',
  validateBody(adminUserUpdateSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      const body = req.body as z.infer<typeof adminUserUpdateSchema>;
      if (body.email) {
        const taken = await UserModel.findOne({
          email: body.email,
          _id: { $ne: req.params.id },
        }).lean();
        if (taken) {
          res.status(409).json({ error: true, message: 'Email already in use' });
          return;
        }
      }
      const update: Record<string, unknown> = {};
      if (body.fullName !== undefined) update.fullName = body.fullName;
      if (body.email !== undefined) update.email = body.email;
      if (body.role !== undefined) update.role = body.role;
      if (body.password !== undefined) {
        update.password = await hashPassword(body.password);
      }
      const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
      if (!user) {
        res.status(404).json({ error: true, message: 'User not found' });
        return;
      }
      res.json(publicUser(user));
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.delete('/users/:id', async (req: AuthedRequest, res, next) => {
  try {
    if (req.params.id === req.user?.id) {
      res.status(400).json({ error: true, message: 'Cannot delete your own account' });
      return;
    }
    const user = await UserModel.findByIdAndDelete(req.params.id).lean();
    if (!user) {
      res.status(404).json({ error: true, message: 'User not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/categories', validateQuery(adminListQuery), async (req, res, next) => {
  try {
    const q = (req as typeof req & { validatedQuery: z.infer<typeof adminListQuery> })
      .validatedQuery;
    const filter: Record<string, unknown> = {};
    if (q.q) {
      filter.name = new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      CategoryModel.find(filter).sort({ name: 1 }).skip(skip).limit(q.limit).lean(),
      CategoryModel.countDocuments(filter),
    ]);
    res.json({
      items: items.map(mapCategory),
      page: q.page,
      limit: q.limit,
      total,
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/categories', validateBody(categoryCreateSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof categoryCreateSchema>;
    const exists = await CategoryModel.exists({ slug: body.slug });
    if (exists) {
      res.status(409).json({ error: true, message: 'Slug already exists' });
      return;
    }
    const c = await CategoryModel.create(body);
    res.status(201).json(mapCategory(c.toObject()));
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/categories/:id', async (req, res, next) => {
  try {
    const c = await CategoryModel.findById(req.params.id).lean();
    if (!c) {
      res.status(404).json({ error: true, message: 'Category not found' });
      return;
    }
    res.json(mapCategory(c));
  } catch (e) {
    next(e);
  }
});

adminRouter.put(
  '/categories/:id',
  validateBody(categoryUpdateSchema),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof categoryUpdateSchema>;
      if (body.slug) {
        const taken = await CategoryModel.findOne({
          slug: body.slug,
          _id: { $ne: req.params.id },
        }).lean();
        if (taken) {
          res.status(409).json({ error: true, message: 'Slug already in use' });
          return;
        }
      }
      const c = await CategoryModel.findByIdAndUpdate(req.params.id, body, { new: true }).lean();
      if (!c) {
        res.status(404).json({ error: true, message: 'Category not found' });
        return;
      }
      res.json(mapCategory(c));
    } catch (e) {
      next(e);
    }
  },
);

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    const inUse = await CourseModel.exists({ categoryId: req.params.id });
    if (inUse) {
      res.status(400).json({
        error: true,
        message: 'Category is used by courses; reassign or delete courses first',
      });
      return;
    }
    const c = await CategoryModel.findByIdAndDelete(req.params.id).lean();
    if (!c) {
      res.status(404).json({ error: true, message: 'Category not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/courses', validateQuery(adminListQuery), async (req, res, next) => {
  try {
    const q = (req as typeof req & { validatedQuery: z.infer<typeof adminListQuery> })
      .validatedQuery;
    const filter: Record<string, unknown> = {};
    if (q.q) {
      filter.$text = { $search: q.q };
    }
    if (q.categoryId) {
      filter.categoryId = q.categoryId;
    }
    const skip = (q.page - 1) * q.limit;
    const base = CourseModel.find(filter)
      .skip(skip)
      .limit(q.limit)
      .populate('categoryId', 'name slug');
    if (q.q) {
      base.select({ score: { $meta: 'textScore' } });
      base.sort({ score: { $meta: 'textScore' } } as Record<string, 1 | { $meta: string }>);
    } else {
      base.sort({ createdAt: -1 });
    }
    const [items, total] = await Promise.all([base.lean(), CourseModel.countDocuments(filter)]);
    res.json({
      items: items.map(mapCourseAdmin),
      page: q.page,
      limit: q.limit,
      total,
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.post('/courses', validateBody(courseCreateSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof courseCreateSchema>;
    const cat = await CategoryModel.findById(body.categoryId).lean();
    if (!cat) {
      res.status(400).json({ error: true, message: 'Invalid category' });
      return;
    }
    const course = await CourseModel.create({
      title: body.title,
      description: body.description,
      thumbnail: body.thumbnail || undefined,
      price: body.price,
      categoryId: body.categoryId,
      isPublished: body.isPublished ?? false,
      featured: body.featured ?? false,
    });
    const populated = await CourseModel.findById(course._id)
      .populate('categoryId', 'name slug')
      .lean();
    res.status(201).json(mapCourseAdmin(populated!));
    if (course.isPublished) {
      void notifyRequestsMatchingCourse({
        _id: course._id,
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        isPublished: course.isPublished,
      });
    }
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/courses/:id', async (req, res, next) => {
  try {
    const course = await CourseModel.findById(req.params.id)
      .populate('categoryId', 'name slug')
      .lean();
    if (!course) {
      res.status(404).json({ error: true, message: 'Course not found' });
      return;
    }
    res.json(mapCourseAdmin(course));
  } catch (e) {
    next(e);
  }
});

adminRouter.put('/courses/:id', validateBody(courseUpdateSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof courseUpdateSchema>;
    if (body.categoryId) {
      const cat = await CategoryModel.findById(body.categoryId).lean();
      if (!cat) {
        res.status(400).json({ error: true, message: 'Invalid category' });
        return;
      }
    }
    const course = await CourseModel.findByIdAndUpdate(req.params.id, body, { new: true })
      .populate('categoryId', 'name slug')
      .lean();
    if (!course) {
      res.status(404).json({ error: true, message: 'Course not found' });
      return;
    }
    res.json(mapCourseAdmin(course));
    if (course.isPublished) {
      const raw = await CourseModel.findById(course._id).lean();
      if (raw) {
        void notifyRequestsMatchingCourse({
          _id: raw._id,
          title: raw.title,
          description: raw.description,
          categoryId: raw.categoryId,
          isPublished: raw.isPublished,
        });
      }
    }
  } catch (e) {
    next(e);
  }
});

adminRouter.delete('/courses/:id', async (req, res, next) => {
  try {
    const course = await CourseModel.findByIdAndDelete(req.params.id).lean();
    if (!course) {
      res.status(404).json({ error: true, message: 'Course not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

adminRouter.get('/course-requests', validateQuery(adminListQuery), async (req, res, next) => {
  try {
    const q = (req as typeof req & { validatedQuery: z.infer<typeof adminListQuery> })
      .validatedQuery;
    const filter: Record<string, unknown> = {};
    if (q.q) {
      const esc = q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(esc, 'i');
      filter.$or = [{ email: rx }, { note: rx }];
    }
    const skip = (q.page - 1) * q.limit;
    const base = CourseRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(q.limit)
      .populate('categoryId', 'name slug');
    const [items, total] = await Promise.all([base.lean(), CourseRequestModel.countDocuments(filter)]);
    res.json({
      items: items.map(mapCourseRequestAdmin),
      page: q.page,
      limit: q.limit,
      total,
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.delete('/course-requests/:id', async (req, res, next) => {
  try {
    const doc = await CourseRequestModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ error: true, message: 'Course request not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

function mapCourseRequestAdmin(r: {
  _id: unknown;
  email: string;
  categoryId?: unknown;
  note?: string;
  matchedCourseIds?: unknown[];
  createdAt: Date;
}) {
  const cat = r.categoryId as { _id: unknown; name: string; slug: string } | null | undefined;
  const mids = (r.matchedCourseIds ?? []) as unknown[];
  return {
    _id: String(r._id),
    email: r.email,
    categoryId: cat ? String(cat._id) : r.categoryId ? String(r.categoryId) : undefined,
    category: cat
      ? { _id: String(cat._id), name: cat.name, slug: cat.slug }
      : undefined,
    note: r.note,
    matchedCount: mids.length,
    matchedCourseIds: mids.map((id) => String(id)),
    createdAt: r.createdAt.toISOString(),
  };
}

function publicUser(u: {
  _id: unknown;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: Date;
}) {
  return {
    _id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    createdAt: u.createdAt.toISOString(),
  };
}

function mapCategory(c: {
  _id: unknown;
  name: string;
  image?: string;
  slug: string;
  createdAt: Date;
}) {
  return {
    _id: String(c._id),
    name: c.name,
    image: c.image,
    slug: c.slug,
    createdAt: c.createdAt.toISOString(),
  };
}

function mapCourseAdmin(course: {
  _id: unknown;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  categoryId: unknown;
  isPublished: boolean;
  featured?: boolean;
  createdAt: Date;
}) {
  const cat = course.categoryId as
    | { _id: unknown; name: string; slug: string }
    | null
    | undefined;
  return {
    _id: String(course._id),
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    price: course.price,
    categoryId: cat ? String(cat._id) : String(course.categoryId),
    category: cat
      ? { _id: String(cat._id), name: cat.name, slug: cat.slug }
      : undefined,
    isPublished: course.isPublished,
    featured: Boolean(course.featured),
    createdAt: course.createdAt.toISOString(),
  };
}
