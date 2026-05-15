import { Router } from 'express';
import { z } from 'zod';
import { paginationQuerySchema } from '@repo/validation';
import { CourseModel } from '../../models/course.model.js';
import { CategoryModel } from '../../models/category.model.js';
import { validateQuery } from '../../middlewares/validate.middleware.js';

const listQuerySchema = paginationQuerySchema.extend({
  categoryId: z.string().optional(),
  featured: z.enum(['true']).optional(),
});

export const coursesRouter = Router();

coursesRouter.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const q = (req as typeof req & { validatedQuery: z.infer<typeof listQuerySchema> })
      .validatedQuery;
    const filter: Record<string, unknown> = { isPublished: true };
    if (q.categoryId) {
      filter.categoryId = q.categoryId;
    }
    if (q.featured === 'true') {
      filter.featured = true;
    }
    if (q.q) {
      filter.$text = { $search: q.q };
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
      items: items.map(mapCourse),
      page: q.page,
      limit: q.limit,
      total,
    });
  } catch (e) {
    next(e);
  }
});

coursesRouter.get('/:id', async (req, res, next) => {
  try {
    const course = await CourseModel.findOne({
      _id: req.params.id,
      isPublished: true,
    })
      .populate('categoryId', 'name slug')
      .lean();
    if (!course) {
      res.status(404).json({ error: true, message: 'Course not found' });
      return;
    }
    res.json(mapCourse(course));
  } catch (e) {
    next(e);
  }
});

function mapCourse(course: {
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
